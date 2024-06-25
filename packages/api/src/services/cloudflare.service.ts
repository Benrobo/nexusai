import axios from "axios";
import env from "../config/env.js";
import logger from "../config/logger.js";

/**
 * @name cfQwenChat
 *
 * @description use cloudflare qwen1.5 LLM model for efficient, accurate and blazing-fast low-bit weight quantization method, currently supporting 4-bit quantization.
 */

interface ICFQwenChat {
  custom_prompt?: {
    prompt: string;
    messages?: {
      role?: "system" | "user";
      content?: string;
    }[];
  };
  context?: string;
}

export async function cfQwenChat(props: ICFQwenChat) {
  let resp = {
    data: null,
    error: null,
  };
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${env.CF.ACCT_ID}/ai/run/@cf/qwen/qwen1.5-14b-chat-awq`;

    const defaultPrompt = {
      stream: false,
      ...props.custom_prompt,
    };

    const response = await axios.post(url, defaultPrompt, {
      headers: {
        Authorization: `Bearer ${env.CF.AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    resp.data = response.data;
    return resp;
  } catch (e: any) {
    console.log(e?.response?.data?.errors);
    logger.error("Error running cloudflare qwen llm model:", e);
    resp.error = e?.response?.data ?? e.message;
    return resp;
  }
}
