import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../config/env.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

interface IFunctionCall {
  contents: {
    role: "user" | "system";
    parts: {
      text: string;
    };
  };
  tools: {
    func_name: string;
    description: string;
    parameters: {
      type: string;
      properties: {
        [key: string]: {
          type: string;
          description: string;
        };
      };
    };
    required: string[];
  }[];
}

interface IFuncCallResult {
  content: {
    role: string;
    parts: {
      text: string;
    };
  };
  tools: {
    function_declarations: {
      name: string;
      description: string;
      parameters: {
        type: string;
        properties: {
          [key: string]: {
            type: string;
            description: string;
          };
        };
      };
    }[];
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

  // function calling
  private constructFunctionCallProperties(props: IFunctionCall) {
    const finalConstruct: IFuncCallResult = {
      content: {
        role: props.contents.role ?? "",
        parts: {
          text: props.contents.parts.text ?? "",
        },
      },
      tools: [
        {
          function_declarations: props.tools.map((t) => ({
            name: t.func_name,
            description: t.description,
            parameters: {
              type: t.parameters.type,
              properties: t.parameters.properties,
              required: t.required,
            },
          })),
        },
      ],
    };

    return finalConstruct;
  }

  public async functionCall(props: IFunctionCall) {
    const func_call_payload = this.constructFunctionCallProperties(props);

    console.log(func_call_payload);
  }
}
