import { DEFAULT_CALL_INTENTS } from "../data/agent/config.js";
import GeminiService from "./gemini.service.js";

export default class AIService {
  private geminiService = new GeminiService();
  constructor() {}

  public async determineCallIntent(msg: string) {
    const intentCallResp = await this.geminiService.functionCall({
      contents: {
        role: "user",
        parts: {
          text: msg,
        },
      },
      tools: [
        {
          func_name: "determine_call_intent",
          description: `Identify call intent or action from the given prompt. Actions must be returned in one word, all caps, and underscored. Also, the title and subtitle and emoji must be returned if available.
              Also, Identify users intent or action from the given prompt. You need to decide from the given prompt if they want to update either (title, subtitle, cover image, content) or not.`,
          parameters: {
            type: "object",
            properties: {
              action: {
                type: "string",
                description: `The user request action gotten from the prompt, supported actions/intents are ${DEFAULT_CALL_INTENTS.join(
                  ""
                )}`,
              },
            },
          },
          required: ["action"],
        },
      ],
    });
  }

  public async handleConversation(user_input: string) {
    const callIntent = this.determineCallIntent(user_input);
  }
}
