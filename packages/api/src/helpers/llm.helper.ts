import axios from "axios";
import env from "../config/env.js";

export type LLMRoles = "system" | "user" | "assistant";

export interface LLMResponseProps {
  messages: {
    role: LLMRoles;
    content: string;
  }[];
}

export async function getLLMResponse(messages: LLMResponseProps["messages"]) {
  // use qwen: @cf/qwen/qwen1.5-14b-chat-awq
  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF.ACCT_ID}/ai/run/@cf/qwen/qwen1.5-14b-chat-awq`,
    { messages },
    {
      headers: {
        Authorization: `Bearer ${env.CF.AUTH_TOKEN}`,
      },
    }
  );
  const data = response?.data?.result;
  return data;
}
