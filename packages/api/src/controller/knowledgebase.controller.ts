import { Request, Response } from "express";
import { RESPONSE_CODE, type IReqObject } from "../types/index.js";
import BaseController from "./base.controller.js";
import { FileHelper } from "../helpers/file.helper.js";
import HttpException from "../lib/exception.js";
import ZodValidation from "../lib/zodValidation.js";
import {
  addKbSchema,
  crawlPageSchema,
  deleteKbSchema,
  linkKbSchema,
  retrainSchema,
  unlinkKbSchema,
} from "../lib/schema_validation.js";
import GeminiService from "../services/gemini.service.js";
import shortUUID from "short-uuid";
import prisma from "../prisma/prisma.js";
import sendResponse from "../lib/sendResponse.js";
import KbHelper from "../helpers/kb.helper.js";
import type { KnowledgeBaseType } from "@prisma/client";
import logger from "../config/logger.js";
import {
  extractLinkMarkupUsingLLMV2,
  scrapeLinksFromWebpage,
} from "../services/scrapper.js";
import redis from "../config/redis.js";

interface addKbPayload {
  title: string;
  type: KnowledgeBaseType;
  agent_id: string;
  refId: string;
  url: string;
  trashLinks?: string; // only when type is WEB_PAGES
}

interface IRetrainData {
  agent_id: string;
  kb_id: string;
}

type SavedWebCachedData = {
  url: string;
  refId: string;
  content: {
    url: string;
    content: string;
  }[];
};

export default class KnowledgeBaseController extends BaseController {
  private fileHelper: FileHelper;
  private googleService: GeminiService;
  constructor() {
    super();
    this.fileHelper = new FileHelper();
    this.googleService = new GeminiService();
  }

  private async activateAgent(agent_id: string) {
    await prisma.agents.update({
      where: {
        id: agent_id,
      },
      data: {
        activated: true,
      },
    });
  }

  // add knowledge base
  public async addKb(req: Request & IReqObject, res: Response) {
    const file = req.file;
    const payload = req.body as addKbPayload;
    const mimeType = file?.mimetype;

    await ZodValidation(addKbSchema, payload, req.serverUrl);

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agent_id,
        userId: req.user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    const withFileTypes = ["TXT", "PDF", "MD"];

    // handle FILE types
    if (file && payload.type === "PDF") {
      if (!file && !withFileTypes.includes(payload.type)) {
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "File is required",
          400
        );
      }

      //pdf, md, docx, txt
      const validFileType = ["application/pdf", "text/markdown", "text/plain"];
      this.fileHelper.validateFileType(mimeType, validFileType);

      const validSize = 1024 * 1024 * 4.5; // 4.5MB
      this.fileHelper.validSize(file.size, validSize);

      const filename = file.originalname.replace(/\s/g, "_");

      const fileData = file.buffer;

      // Uint8Array
      const fileBuffer = new Uint8Array(fileData);

      const pdfText = await this.fileHelper.extractPdfText(fileBuffer);

      // generate embedding
      const embedding = await this.googleService.generateEmbedding(pdfText);

      // create knowledgebase
      const kb = await prisma.knowledgeBase.create({
        data: {
          id: shortUUID.generate(),
          userId: req.user.id,
          status: "trained",
        },
      });

      if (!kb) {
        throw new HttpException(
          RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          "Error adding knowledge base, try again later.",
          500
        );
      }

      // save kb data
      for (const emb of embedding) {
        await KbHelper.addKnowledgeBaseData({
          id: shortUUID.generate(),
          kb_id: kb.id,
          user_id: req.user.id,
          title: payload.title ?? filename,
          type: payload.type,
          embedding: emb.embedding,
          content: emb.content,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // link knowledge base to agent
      await prisma.linkedKnowledgeBase.create({
        data: {
          agentId: payload.agent_id,
          kb_id: kb.id,
        },
      });

      // activate agent if it not activated
      await this.activateAgent(payload.agent_id);

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Knowledge base added successfully",
        200
      );
    }

    // handle WEB_PAGES type
    if (payload.type === "WEB_PAGES") {
      const { refId, url, trashLinks } = payload;
      const cachedData = await redis.get(url);

      if (!cachedData) {
        logger.error("Cached data not found in redis");
        throw new HttpException(
          RESPONSE_CODE.NOT_FOUND,
          "Webpage not found, invalid reference ID.",
          404
        );
      }

      const data = JSON.parse(cachedData) as SavedWebCachedData;
      const dataExists = data.refId === refId;

      if (!dataExists) {
        logger.error("RefId not found in cached data");
        throw new HttpException(
          RESPONSE_CODE.NOT_FOUND,
          "Webpage not found, try again later.",
          404
        );
      }

      const modifiedMarkup = data.content.filter((c) => {
        if (!trashLinks) return true;
        const trash = trashLinks.split(",");
        return !trash.includes(c.url);
      });

      if (modifiedMarkup.length === 0) {
        logger.error("No valid links found while modifying markup");
        throw new HttpException(
          RESPONSE_CODE.BAD_REQUEST,
          "No valid links found, try again later.",
          400
        );
      }

      // create knowledgebase
      const kb = await prisma.knowledgeBase.create({
        data: {
          id: shortUUID.generate(),
          userId: req.user.id,
          status: "trained",
        },
      });

      if (!kb) {
        throw new HttpException(
          RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          "Error adding knowledge base, try again later.",
          500
        );
      }

      try {
        for (const c of modifiedMarkup) {
          const embedding = await this.googleService.generateEmbedding(
            c.content
          );

          for (const emb of embedding) {
            await KbHelper.addKnowledgeBaseData({
              id: shortUUID.generate(),
              kb_id: kb.id,
              user_id: req.user.id,
              title: c.url,
              type: payload.type,
              embedding: emb.embedding,
              content: emb.content,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        }
      } catch (e: any) {
        // if an error occur, delete created kb
        await prisma.knowledgeBase.delete({
          where: {
            id: kb.id,
          },
        });

        throw new HttpException(
          RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          "Error adding knowledge base, try again later.",
          500
        );
      }

      // link knowledge base to agent
      await prisma.linkedKnowledgeBase.create({
        data: {
          agentId: payload.agent_id,
          kb_id: kb.id,
        },
      });

      // activate agent if it not activated
      await this.activateAgent(payload.agent_id);

      // clear cache
      await redis.del(url);

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Knowledge base added successfully",
        200
      );
    }
  }

  public async deleteKb(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const params = req.params;

    await ZodValidation(deleteKbSchema, params, req.serverUrl);

    const { agent_id, kb_id } = params;

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: agent_id,
        userId: user.id,
      },
    });

    const kb = await prisma.knowledgeBase.findFirst({
      where: {
        id: kb_id,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    if (!kb) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Knowledge base not found",
        404
      );
    }

    // delete kb
    await prisma.knowledgeBase.delete({
      where: {
        id: kb_id,
        userId: user.id,
      },
    });

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Knowledge base deleted successfully",
      200
    );
  }

  public async crawlWebpage(req: Request & IReqObject, res: Response) {
    const payload = req.body as { url: string; agent_id: string };
    const user = req.user;

    await ZodValidation(crawlPageSchema, payload, req.serverUrl);

    const { url, agent_id } = payload;

    // check if agent exists

    const agent = await prisma.agents.findFirst({
      where: {
        id: agent_id,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if cahced data exists
    const cachedData = await redis.get(url);

    if (cachedData) {
      const data = JSON.parse(cachedData) as SavedWebCachedData;
      const links = data?.content?.map((d) => d.url);

      if (links.length === 0) {
        throw new HttpException(
          RESPONSE_CODE.NOT_FOUND,
          "No links found on the webpage",
          404
        );
      }

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Webpage links fetched successfully",
        200,
        {
          refId: data.refId,
          links,
        }
      );
    }

    // crawl page
    const links = await scrapeLinksFromWebpage(url);
    const markup = await extractLinkMarkupUsingLLMV2(links);

    // if markup is empty
    if (markup.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "No links found on the webpage",
        404
      );
    }

    // save content in redis for 10min
    const ttl = 60 * 10; // 10min
    const refId = shortUUID.generate();
    const data = JSON.stringify({
      refId: refId,
      url,
      content: markup,
    });

    await redis.set(url, data);
    await redis.expire(url, ttl);

    // send the urls to the client
    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Webpage links fetched successfully",
      200,
      {
        refId,
        // Return processed URLs to client, ensuring consistency between scraped and processed data, especially in error cases
        links: markup.map((m) => m.url),
      }
    );
  }

  // link knowledge base to agent
  public async linkKbToAgent(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const { agent_id, kb_ids } = req.body;

    await ZodValidation(linkKbSchema, { agent_id, kb_ids }, req.serverUrl);

    // check if agent exists
    const agent = await prisma.agents.findUnique({
      where: {
        id: agent_id,
        userId,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if kb exists
    const kb = await prisma.knowledgeBase.findMany({
      where: {
        id: {
          in: kb_ids,
        },
        userId,
      },
      include: {
        kb_data: true,
      },
    });

    if (kb.length !== kb_ids.length) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        `One or more knowledge base not found`,
        404
      );
    }

    const linkedKb: { title: string }[] = [];
    for (const k of kb) {
      const kbData = k.kb_data;
      const isLinked = await prisma.linkedKnowledgeBase.findFirst({
        where: {
          agentId: agent_id,
          kb_id: k.id,
        },
      });

      if (isLinked) {
        linkedKb.push({ title: kbData[0].title });
      }
    }

    if (linkedKb.length > 0) {
      const msg =
        linkedKb.length > 1
          ? `One or more of this knowledegebase are already linked to this agent`
          : `Knowledge base "${linkedKb[0].title}" is already linked to this agent`;
      throw new HttpException(RESPONSE_CODE.AGENT_ALREADY_LINKED, msg, 400);
    }

    // link kb to agent
    const linkKb = kb.map((k) => {
      return {
        agentId: agent_id,
        kb_id: k.id,
      };
    });

    await prisma.linkedKnowledgeBase.createMany({
      data: linkKb,
    });

    // activate agent if it not activated
    if (!agent.activated) {
      await prisma.agents.update({
        where: {
          id: agent_id,
        },
        data: {
          activated: true,
        },
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Knowledge base linked to agent successfully",
      200
    );
  }

  // unlink knowledge base from agent
  public async unlinkKbFromAgent(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const { agent_id, kb_id } = req.body;

    await ZodValidation(unlinkKbSchema, { agent_id, kb_id }, req.serverUrl);

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: agent_id,
        userId,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if kb exists
    const kb = await prisma.knowledgeBase.findMany({
      where: {
        id: kb_id,
        userId,
      },
    });

    if (kb.length === 0) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        `Knowledge base not found`,
        404
      );
    }

    // check if that kb is linked to the agent
    const linkedKb = await prisma.linkedKnowledgeBase.findFirst({
      where: {
        agentId: agent_id,
        kb_id,
      },
    });

    if (!linkedKb) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        `Knowledge base is not linked to this agent, failed to delete`,
        404
      );
    }

    const allLinkedKb = await prisma.linkedKnowledgeBase.findMany({
      where: {
        agentId: agent_id,
      },
    });

    const lastLinkedKb = allLinkedKb.filter((lkb) => lkb.kb_id !== kb_id);

    // unlink kb from agent
    await prisma.linkedKnowledgeBase.delete({
      where: {
        id: linkedKb.id,
        agentId: agent_id,
      },
    });

    if (lastLinkedKb.length === 0) {
      await prisma.agents.update({
        where: {
          id: agent_id,
        },
        data: {
          activated: false,
        },
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Knowledge base unlinked from agent successfully",
      200
    );
  }

  public async getKnowledgeBase(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;
    const agent_id = req.params["id"];

    if (!agent_id) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "Agent ID is required",
        400
      );
    }

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: agent_id,
        userId,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    const lkb = await prisma.linkedKnowledgeBase.findMany({
      where: {
        agentId: agent_id,
      },
      select: {
        kb: {
          select: {
            kb_data: true,
            status: true,
          },
        },
      },
    });

    const kbData: {
      id: string;
      kb_id: string;
      type: KnowledgeBaseType;
      title: string;
      created_at: Date;
      agent_id: string;
      status?: string;
    }[] = [];

    for (const kb of lkb) {
      const kbD = kb.kb.kb_data[0];
      const firstItem = kbD;
      kbData.push({
        id: firstItem.id,
        kb_id: firstItem.kb_id,
        type: firstItem.type,
        title: firstItem.title,
        created_at: firstItem.created_at,
        agent_id,
        status: kb.kb.status,
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Knowledge base fetched successfully",
      200,
      kbData
    );
  }

  public async getAllKnowledgeBase(req: Request & IReqObject, res: Response) {
    const userId = req.user.id;

    const kb = await prisma.knowledgeBase.findMany({
      where: {
        userId,
      },
      select: {
        linked_knowledge_base: {
          select: {
            agentId: true,
            kb_id: true,
            agents: {
              select: {
                name: true,
              },
            },
          },
        },
        status: true,
        id: true,
        kb_data: true,
      },
    });

    const allKb: {
      id: string;
      type: KnowledgeBaseType;
      title: string;
      status?: string;
      linked_kb: {
        agentId: string;
        kb_id: string;
      }[];
    }[] = [];

    for (const k of kb) {
      const linkedKb = k.linked_knowledge_base;
      const kbData = k.kb_data.find((d) => d.kb_id === k.id);
      allKb.push({
        id: k.id,
        type: kbData.type,
        title: kbData.title,
        status: k.status,
        linked_kb: linkedKb.map((lk) => {
          return {
            agentId: lk.agentId,
            kb_id: lk.kb_id,
            name: lk.agents.name,
          };
        }),
      });
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Knowledge base fetched successfully",
      200,
      allKb
    );
  }

  /* for now , we can only retrain webpages data */
  /* Since PDF buffer/binary aren't getting stored anywhere */
  public async retrainData(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const payload = req.body as IRetrainData;

    await ZodValidation(retrainSchema, payload, req.serverUrl);

    // check if agent exists
    const agent = await prisma.agents.findFirst({
      where: {
        id: payload.agent_id,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if kb exists
    const kb = await prisma.knowledgeBase.findFirst({
      where: {
        id: payload.kb_id,
        userId: user.id,
      },
      select: {
        kb_data: {
          select: {
            id: true,
            type: true,
            title: true, // url
          },
        },
      },
    });

    if (!kb) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Knowledge base not found",
        404
      );
    }

    // make sure kb type is no other than WEB_PAGES
    // @ts-expect-error
    if (!kb.kb_data[0]?.type === "WEB_PAGES") {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Knowledge base type must be WEB_PAGES",
        404
      );
    }

    const kbData = kb.kb_data;
    const url = kbData
      .map((k) => k.title)
      .filter((v, i, a) => a.findIndex((d) => d === v) === i);
    const markup = await extractLinkMarkupUsingLLMV2(url);

    // update kb data with new embedding
    for (const m of markup) {
      const embedding = await this.googleService.generateEmbedding(m.content);

      for (const emb of embedding) {
        await KbHelper.updateKnowledgeBaseData({
          id: shortUUID.generate(),
          kb_id: payload.kb_id,
          user_id: user.id,
          title: m.url,
          embedding: emb.embedding,
          content: emb.content,
          updated_at: new Date(),
        });
      }
    }

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Knowledge base retrained successfully",
      200
    );
  }
}
