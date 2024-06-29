import type { FunctionDeclarationSchemaType } from "@google/generative-ai";

export interface IFunctionCall {
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

export interface ICallAIProps {
  instruction: string;
  user_prompt: string;
  enable_call_history?: boolean;
  history?: {
    role: "user" | "system";
    parts: {
      text: string;
    }[];
  }[];
}

export type VectorSimilaritySearchProp = {};
