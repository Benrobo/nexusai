import {
  FunctionDeclarationSchemaType,
  GoogleGenerativeAI,
  type FunctionCall,
  type GenerateContentResult,
} from "@google/generative-ai";
import env from "../config/env.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import logger from "../config/logger.js";
import HttpException from "../lib/exception.js";
import { RESPONSE_CODE, type AgentType } from "../types/index.js";
import type { FunctionCallingNames } from "../types/agent.types.js";
import type { ICallAIProps, IFunctionCall } from "../types/gemini.types.js";

export default class GeminiService {
  private genAI: GoogleGenerativeAI;
  // private cacheManager: GoogleAIC
  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async generateEmbedding(data: string) {
    if (!data) {
      // throw new Error("Data is required");
      data = "Hello there.";
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
    } as { error: any; data: FunctionCall[] | null };
    try {
      const generativeModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [
          {
            // @ts-expect-error
            functionDeclarations: props.tools.map((t) => ({
              name: t.func_name as FunctionCallingNames,
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
      const call = result.response.functionCalls();

      logger.info("Function call:");
      logger.info(result.response.usageMetadata);

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

  private constructChatHistory(
    data: { userPrompt: string; aiPrompt: string }[]
  ) {
    const history = [] as { role: string; parts: { text: string }[] }[];
    for (const d of data) {
      history.push({
        role: "user",
        parts: [{ text: d.userPrompt }],
      });
      history.push({
        role: "system",
        parts: [{ text: d.aiPrompt }],
      });
    }
    return history;
  }

  // Call GEMINI AI to handle user's conversation
  public async callAI(props: ICallAIProps) {
    let resp: { data: string | null; error: string | null } = {
      data: null,
      error: null,
    };
    try {
      const genModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: props.instruction,
      });

      let result: GenerateContentResult;

      if (!props?.enable_call_history) {
        result = await genModel.generateContent(props.user_prompt);
      } else {
        const chat = genModel.startChat({
          history: props?.history,
          systemInstruction: props.instruction,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });

        result = await chat.sendMessage(props.user_prompt);
      }

      resp.data = result.response.text();
      return resp;
    } catch (e: any) {
      console.log(e);
      logger.error("GenAI response error", e);
      resp.error = e;
      return resp;
    }
  }

  public async similaritySearch() {}
}
