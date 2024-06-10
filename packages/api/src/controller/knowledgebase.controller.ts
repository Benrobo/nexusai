import { Request, Response } from "express";
import { RESPONSE_CODE, type IReqObject } from "../types/index.js";
import BaseController from "./base.controller.js";
import { FileHelper } from "../helpers/file.helper.js";
import HttpException from "../lib/exception.js";
import ZodValidation from "../lib/zodValidation.js";
import { addKbSchema } from "../lib/schema_validation.js";
import GeminiService from "../services/gemini.service.js";
import shortUUID from "short-uuid";
import prisma from "../prisma/prisma.js";
import sendResponse from "../lib/sendResponse.js";
import type { KnowledgeBaseType } from "@prisma/client";
// import type GeminiService from "../services/gemini.service.js";

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
    const payload = req.body;
    const mimeType = file?.mimetype;

    await ZodValidation(addKbSchema, payload, req.serverUrl);

    const withFileTypes = ["TXT", "PDF", "MD"];

    if (!file && !withFileTypes.includes(payload.type)) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "File is required",
        400
      );
    }

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

      // save kb data
      const kbId = shortUUID.generate();

      if (embedding.length > 0) {
        // update kb data with embeddings
        await prisma.$executeRaw`
          INSERT INTO public."knowledge_base_data" (id,"user_id", "type", title, embedding, created_at, updated_at) 
          VALUES (
            ${kbId},
            ${req.user.id},
            ${payload.type}::"KnowledgeBaseType",
            ${payload.title ?? filename},
            ${embedding}::numeric[],
            now(),
            now()
          )
        `;
      }

      return sendResponse.success(
        res,
        RESPONSE_CODE.SUCCESS,
        "Knowledge base added successfully",
        200,
        {
          id: kbId,
        }
      );
    }

    // const pdfText = this.fileHelper.extractText(req.body.pdf);
  }
}
