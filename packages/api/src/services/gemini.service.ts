import {
  FunctionDeclarationSchemaType,
  GoogleGenerativeAI,
  type FunctionCall,
  type FunctionDeclarationsTool,
} from "@google/generative-ai";
import env from "../config/env.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import logger from "../config/logger.js";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE } from "../types/index.js";

interface IFunctionCall {
  prompt: string;
  tools: {
    func_name: string;
    description: string;
    parameters: {
      type: string;
      properties: {
        [key: string]: FunctionDeclarationSchemaType;
      };
    };
    required: string[];
  }[];
}

export default class GeminiService {
  private genAI: GoogleGenerativeAI;
  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async generateEmbedding(data: string) {
    if (!data) {
      throw new Error("Data is required");
    }

    const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    const chunkText = await this.chunkText(data);
    const result = [] as { embedding: number[]; content: string }[];
    for (const chunk of chunkText) {
      const { embedding } = await model.embedContent(chunk);
      result.push({
        content: chunk,
        embedding: embedding.values,
      });
    }
    return result;
  }

  public async chunkText(data: string) {
    if (!data) {
      throw new Error("Data is required");
    }

    // Split the text into chunks
    // getting rid of any text overlaps
    // for eg "testing" -> "test", "ing"
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // max characters per chunk
      chunkOverlap: 150, // overlap between chunks
    });

    const tokens = await splitter.splitText(data as any);

    return tokens;
  }

  public async functionCall(props: IFunctionCall) {
    let resp = {
      error: null,
      data: null,
    } as { error: any; data: FunctionCall | null };
    try {
      const generativeModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [
          {
            // @ts-expect-error
            functionDeclarations: props.tools.map((t) => ({
              name: t.func_name,
              description: t.description,
              parameters: {
                type: t.parameters.type as FunctionDeclarationSchemaType,
                properties: t.parameters.properties,
                required: t.required,
              },
            })),
          },
        ],
      });

      const chat = generativeModel.startChat();
      // Send the message to the model.
      const result = await chat.sendMessage(props.prompt!);

      // For simplicity, this uses the first function call found.
      const call = result.response.functionCalls()[0];

      resp.data = call;
      return resp;
    } catch (e: any) {
      logger.error("Error calling AI function", e);
      resp.error = e;
      throw new HttpException(
        RESPONSE_CODE.GENERATIVE_AI_ERROR,
        "Error calling AI function",
        400
      );
    }
  }
}
