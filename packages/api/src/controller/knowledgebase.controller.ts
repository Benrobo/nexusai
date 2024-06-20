import { Request, Response } from "express";
import { RESPONSE_CODE, type IReqObject } from "../types/index.js";
import BaseController from "./base.controller.js";
import { FileHelper } from "../helpers/file.helper.js";
import HttpException from "../lib/exception.js";
import ZodValidation from "../lib/zodValidation.js";
import { addKbSchema, linkKbSchema } from "../lib/schema_validation.js";
import GeminiService from "../services/gemini.service.js";
import shortUUID from "short-uuid";
import prisma from "../prisma/prisma.js";
import sendResponse from "../lib/sendResponse.js";
import KbHelper from "../helpers/kb.helper.js";
import type { KnowledgeBaseType } from "@prisma/client";
import logger from "../config/logger.js";

interface addKbPayload {
  title: string;
  type: KnowledgeBaseType;
  agent_id: string;
}

interface IRetrainData {
  agent_id: string;
  kb_id: string;
}

export default class KnowledgeBaseController extends BaseController {
  private fileHelper: FileHelper;
  private googleService: GeminiService;
  constructor() {
    super();
    this.fileHelper = new FileHelper();
    this.googleService = new GeminiService();
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

    if (!file && !withFileTypes.includes(payload.type)) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "File is required",
        400
      );
    }

    // handle FILE types
    if (file) {
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

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Knowledge base added successfully",
        200
      );
    }

    //! handle WEB_PAGES
    if (payload.type === "WEB_PAGES") {
    }
    // const pdfText = this.fileHelper.extractText(req.body.pdf);
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

    // check if kb is already linked
    for (const k of kb) {
      const kbData = k.kb_data;
      for (const data of kbData) {
        const isLinked = await prisma.linkedKnowledgeBase.findFirst({
          where: {
            agentId: agent_id,
            kb_id: data.id,
          },
        });

        if (isLinked) {
          throw new HttpException(
            RESPONSE_CODE.AGENT_ALREADY_LINKED,
            `Knowledge base "${data.title}" is already linked to agent "${agent.name}"`,
            400
          );
        }
      }
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

    return sendResponse.success(
      res,
      RESPONSE_CODE.SUCCESS,
      "Knowledge base linked to agent successfully",
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

  /* for now , we can only retrain webpages data */
  /* Since PDF buffer/binary aren't getting stored anywhere */
  public async retrainData(req: Request & IReqObject, res: Response) {
    const user = req.user;
    const payload = req.body as IRetrainData;

    await ZodValidation(linkKbSchema, payload, req.serverUrl);

    // check if agent exists
    const agent = await prisma.agents.findUnique({
      where: {
        id: payload.agent_id,
        userId: user.id,
      },
    });

    if (!agent) {
      throw new HttpException(RESPONSE_CODE.NOT_FOUND, "Agent not found", 404);
    }

    // check if kb exists
    const kb = await prisma.knowledgeBase.findUnique({
      where: {
        id: payload.kb_id,
        userId: user.id,
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
  }
}
