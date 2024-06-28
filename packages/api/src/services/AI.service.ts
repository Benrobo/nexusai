import { DEFAULT_CALL_INTENTS } from "../data/agent/config.js";
import GeminiService from "./gemini.service.js";

export default class AIService {
  private geminiService = new GeminiService();
  constructor() {}

  public async determineCallIntent(msg: string) {
    const intentCallResp = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "determine_call_intent",
          description: `Identify call intent or action from the given prompt. Actions must be returned in one word, all caps, and underscored Note: the action can only be one of the following: 
          ${DEFAULT_CALL_INTENTS.join(", ")}.
          <UserPrompt>${msg}</UserPrompt>,
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-expect-error
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

    return intentCallResp.data;
  }

  public async handleConversation(user_input: string) {
    const callIntent = await this.determineCallIntent(user_input);

    console.log(callIntent);
  }
}
