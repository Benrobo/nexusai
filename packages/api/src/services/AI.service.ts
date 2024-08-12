import type { IFunctionCallResp } from "../types/agent.types.js";
import {
  DEFAULT_CALL_INTENTS,
  DEFAULT_SA_CALL_INTENTS,
} from "../data/agent/config.js";
import GeminiService from "./gemini.service.js";
import type { AgentType } from "../types/index.js";
import {
  antiTheftInstructionPrompt,
  generalCustomerSupportTemplatePrompt,
  salesAssistantInstructionPrompt,
} from "../data/agent/prompt.js";
import type { ConvVoiceCallCacheInfo } from "../types/twilio-service.types.js";
import CallLogsService from "./call-logs.service.js";
import logger from "../config/logger.js";
import prisma from "../prisma/prisma.js";
import redis from "../config/redis.js";
import { getSentimentVariations } from "../data/agent/sentiment.js";
import IntegrationService from "./integration.service.js";
import TelegramHelper from "../helpers/telegram.helper.js";
import env from "../config/env.js";
import BackgroundJobService from "./background-job.service.js";

type IHandleConversationProps = {
  user_input: string;
  agent_type: AgentType;
  cached_conv_info: ConvVoiceCallCacheInfo;
  agent_info: {
    agent_id: string;
    user_id: string;
  };
};

type VectorSimilaritySearchProps = {
  user_input: string;
  agent_id: string;
  data_source_ids: string[];
};

type SimilaritiesResult = {
  match_embeddings: {
    id: string;
    content: string[];
    metadata: string;
    similarity: number;
  };
};

type ProcessAIRequestResponse = {
  msg: string;
  ended?: boolean;
  escallated?: {
    number: string | null;
  };
};

export default class AIService {
  private geminiService = new GeminiService();
  private callLogService = new CallLogsService();
  private integrationService = new IntegrationService();
  private bgJobService = new BackgroundJobService();

  public async determineCallIntent(msg: string, call_history?: string) {
    const intentCallResp = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "determine_call_intent",
          description: `Identify call intent or action from the given prompt. Actions must be returned in one word, all caps, and underscored Note: the action can only be one of the following: 
          ${DEFAULT_CALL_INTENTS.join(", ")}.

          
          <UserPrompt>${msg}</UserPrompt>

          <CallHistory>
            ${call_history ?? "N/A"}
          </CallHistory>
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

    return intentCallResp.data as IFunctionCallResp[];
  }

  public async getCallReason(msg: string, callerName: string) {
    const callReason = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "get_call_reason",
          description: `Extract the reason for the call from the user's message. Do your very best to understand the user's message and extract the reason for the call. It must be short, concise and straignt to the point. If the reason is unclear, prepare a follow-up to clarify the purpose of the call.Use ${callerName} when addressing the caller.

          <examples>
            Input: "I want to know if John is available."
            Reason: "inquiring about John's availability"
            Follow-up: "Could you clarify how you know John, ${callerName}?"
          </examples>

          <input>
            <CallerName>${callerName}</CallerName>
            <UserMessage>${msg}</UserMessage>
          </input>

          Analyze the message and provide:
          1. Reason: [extracted reason or "null" if unclear]
          2. Follow-up: [question to clarify the call's purpose if needed]
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              reason: {
                type: "string",
                description: `The reason for the call extracted from the user's message. set to null if reason can't be found.`,
              },
              // @ts-ignore
              follow_up: {
                type: "string",
                description: `The follow-up response constructed from the extracted reason.`,
              },
            },
          },
          required: ["reason", "follow_up"],
        },
      ],
    });

    return callReason.data as IFunctionCallResp[];
  }

  public async getCallReferral(
    msg: string,
    callerName: string,
    reason: string
  ) {
    const callReferral = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "get_call_referral",
          description: `
          <instruction>
          - Extract the referral for the call from the user's message. Do your very best to understand the user's message.
          - You must be able to tell when a message denotes a referral or where the recipient number was gotten from (this is very important).
          - Be smart in your response, if the message doesn't sound like a referral or where the recipient number was gotten from or sounds like it fishy, construct a follow-up message to clarify the call's purpose.
          - It must be short, concise and straignt to the point.
          - Use ${callerName} when addressing the caller. Adjust the reason provided to fit the follow up message.
          - If the caller dont clearly state where they got the recipient number from, politely redirect their focus on where they got the number from.
          </instruction>

          <examples>
            This are just examples, do not use them as is, rather, use it as a guide to construct your response.

            Input: {ONLY IF THE MESSAGE DENOTE A REFERRAL OR WHERE THE NUMBER WAS GOTTEN FROM}
            Referral: {EXTRACTED REFERRAL} eg "I got your number from a friend. | I was referred by John. | I got your number from the company's website."
            Follow-up: "Understood ${callerName}. I'll pass that information to the recipient. Have a great day."

            Input: {IF THE MESSAGE DOESN'T SOUND LIKE A REFERRAL OR WHERE THE NUMBER WAS GOTTEN FROM}
            Referral: null
            Follow-up: {QUESTION TO CLARIFY THE CALL'S PURPOSE IF NEEDED}

            Do not use the examples above. Construct your response based on the user's message.
          </examples>

          <input>
            <CallerName>${callerName}</CallerName>
            <CallReason>${reason}</CallReason>
            <UserMessage>${msg}</UserMessage>
          </input>

          Analyze the message and provide:
          1. Referral: [extracted referral or "null" if unclear]
          2. Follow-up: [question to clarify the call's purpose if needed]
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              referral: {
                type: "string",
                description: `The referral for the call extracted from the user's message. set to null if referral can't be found.`,
              },
              // @ts-ignore
              follow_up: {
                type: "string",
                description: `The follow-up response constructed from the extracted referral.`,
              },
            },
          },
          required: ["referral", "follow_up"],
        },
      ],
    });

    return callReferral.data as IFunctionCallResp[];
  }

  public async getCallerMessage(msg: string, callerName: string) {
    const callerMessage = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "get_caller_message",
          description: `
            Extract the caller intent. Do your best to understand the user's message in order to extract the intent. It must be short, concise and straignt to the point.
            If unclear, prepare a follow-up to clarify the intent.
            Use ${callerName} when addressing the caller.
            If the intent is extracted, always construct a follow-up message to clarify the call's reason.

            <examples>
              input: "I just want to let {recipient name} know i miss him."
              message: "informing {recipient name} that the caller misses him."
              follow_up: "Got it, Is there a specific reason for your call today ${callerName}?"

              input: "I love you."
              message: "expressing love to the recipient."
              follow_up: "Understood, Is there a specific reason for your call today ${callerName}?"

              input: {IF THE MESSAGE DOESN'T SOUND LIKE A CALL INTENT}
              message: null
              follow_up: {QUESTION TO CLARIFY THE CALL'S PURPOSE IF NEEDED}

            </examples>

            <input>
              <CallerName>${callerName}</CallerName>
              <UserMessage>${msg}</UserMessage>
            </input>
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              message: {
                type: "string",
                description: `The caller's intent extracted from the user's message. set to null if intent can't be found.`,
              },
              // @ts-ignore
              follow_up: {
                type: "string",
                description: `The follow-up response constructed from the extracted caller's message.`,
              },
            },
          },
          required: ["message", "follow_up"],
        },
      ],
    });

    return callerMessage.data as IFunctionCallResp[];
  }

  public async getCallerName(msg: string) {
    const callerName = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "get_caller_name",
          description: `Extract the caller's name from the user's message. Do your very best to understand the user's message and extract the caller's name. It must be short, concise and straignt to the point.

          If the user tries either greeting or asking question (as long it within your domain/context), respond to them in short and concise manner but still request the caller's name.

          for eg:
          input: Hi cassie this is Brad calling
          caller_name: 'Brad'
          follow_up_response: Hi Brad, what message would you like me to pass to the recipient?.

          input: I love you.
          caller_name: 'null'
          follow_up_response: Thanks for the compliment. Could you please tell me your fullname?

          input: hi cassie, how are you?.
          caller_name: 'null'
          follow_up_response: I'm great, thanks for asking. Could you please tell me your fullname?

          If you can't get the caller's name, set the caller_name to null but construct a follow up response by redirecting the user back to the question: 'Could you please tell me your fullname? or construct a better response with that question in mind.

          <UserMessage>${msg}</UserMessage>,
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              caller_name: {
                type: "string",
                description: `The caller's name extracted from the user's message. set to null if name can't be found.`,
              },
              // @ts-ignore
              follow_up_response: {
                type: "string",
                description: `The follow-up response constructed from the extracted caller's name.`,
              },
            },
          },
          required: ["caller_name", "follow_up_response"],
        },
      ],
    });

    return callerName.data as IFunctionCallResp[];
  }

  // determine if the user needs further requests based on follow-up message
  public async determineFurtherRequest(msg: string) {
    const furtherRequest = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "determine_further_request",
          description: `
        Determine if the user needs further requests. Return 'yes' or 'no'.

        User Prompt: ${msg}
        `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              further_request: {
                type: "string",
                description: "Yes or No only.",
              },
            },
          },
          required: ["further_request"],
        },
      ],
    });

    return furtherRequest.data as IFunctionCallResp[];
  }

  private async determineSAIntent(user_msg: string, call_history?: string) {
    const intentCallResp = await this.geminiService.functionCall({
      prompt: user_msg,
      tools: [
        {
          func_name: "determine_call_intent",
          description: `
        Determine the call intent in ONE_WORD, ALL_CAPS, UNDERSCORED format.

        Context: Previous conversations: ${call_history ?? "N/A"}
        Allowed Actions: ${DEFAULT_SA_CALL_INTENTS.join(", ")}
        User Prompt: ${user_msg}

        Instructions:
        1. Choose ONE action from Allowed Actions.
        2. Return ONLY the action word.
        3. If unsure, set to ENQUIRY.
        4. For HANDOVER or ESCALATION, ensure the request aligns with the action.
        `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              action: {
                type: "string",
                description: `Supported actions: ${DEFAULT_SA_CALL_INTENTS.join(", ")}`,
              },
            },
          },
          required: ["action"],
        },
      ],
    });

    return intentCallResp.data as IFunctionCallResp[];
  }

  private async processCallLog(
    cached_conv_info: ConvVoiceCallCacheInfo,
    agent_info: {
      agent_id: string;
      user_id: string;
    },
    user_input: string,
    agent_response: string
  ) {
    const callLog = await this.callLogService.getCallLogById({
      refId: cached_conv_info.callRefId,
    });

    if (!callLog) {
      const newLog = await this.callLogService.createCallLog({
        data: {
          agentId: agent_info.agent_id!,
          userId: agent_info.user_id,
          caller_number: cached_conv_info.callerPhone,
          called_number: cached_conv_info.calledPhone,
          refId: cached_conv_info.callRefId,
          state: cached_conv_info.state,
          country_code: cached_conv_info.country_code,
          zipcode: cached_conv_info.zipcode,
        },
      });

      await this.callLogService.addCallLogMessages({
        data: {
          refId: newLog.refId,
          messages: [
            { entity_type: "user", message: user_input },
            { entity_type: "agent", message: agent_response },
          ],
        },
      });
    } else {
      await this.callLogService.addCallLogMessages({
        data: {
          refId: callLog.refId,
          messages: [
            { entity_type: "user", message: user_input },
            { entity_type: "agent", message: agent_response },
          ],
        },
      });
    }
  }

  public async vectorSimilaritySearch(props: VectorSimilaritySearchProps) {
    const { data_source_ids, user_input } = props;

    let userMsgEmbedding: { embedding: number[]; content: string }[] | null =
      null;
    const cachedEmbedding = await redis.get(user_input);

    if (!cachedEmbedding) {
      userMsgEmbedding = await this.geminiService.generateEmbedding(user_input);
      await redis.set(
        user_input,
        JSON.stringify(userMsgEmbedding),
        "EX",
        60 * 5
      );
    } else {
      userMsgEmbedding = JSON.parse(cachedEmbedding);
    }

    const embeddingsString = JSON.stringify(userMsgEmbedding[0].embedding);
    const kbIdsArrayLiteral = `{${data_source_ids.map((id) => `"${id}"`).join(",")}}`;

    const similarities = await prisma.$queryRaw<SimilaritiesResult[]>`
    SELECT match_embeddings(
      ${embeddingsString},
      0.2,
      5,
      ${kbIdsArrayLiteral}::text[]
    )::json;
  `;

    return similarities.map((sim) => ({
      content: sim.match_embeddings.content,
      similarity: sim.match_embeddings.similarity,
      metadata: sim.match_embeddings.metadata,
    }));
  }

  public async handleConversation(props: IHandleConversationProps) {
    const { user_input, agent_type, agent_info, cached_conv_info } = props;

    if (agent_type === "ANTI_THEFT") {
      return await this.processAntiTheftRequest(props);
    }
    if (agent_type === "SALES_ASSISTANT") {
      return await this.processSalesAssistantRequest(props);
    }
  }

  private async getCallLogHistory(
    refId: string,
    user_input?: string,
    shouldSlice?: boolean
  ) {
    let mainHistory = "";

    const callHistory = await this.callLogService.getCallLogById({
      refId,
    });

    if (callHistory?.messages.length > 0) {
      if (shouldSlice) {
        callHistory.messages.slice(-5).forEach((m) => {
          mainHistory += `\n[${m.entity_type}]: ${m.content}\n`;
        });
      } else {
        callHistory.messages.forEach((m) => {
          mainHistory += `\n[${m.entity_type}]: ${m.content}\n`;
        });
      }

      // add current user requets to mainHistoiry
      if (user_input) mainHistory += `\n[user]: ${user_input}\n`;
    }

    return mainHistory;
  }

  private async getChatHistory(
    refId: string,
    user_input?: string,
    shouldSlice?: boolean
  ) {
    let mainHistory = [] as { role: string; parts: { text: string }[] }[];

    const callHistory = await this.callLogService.getCallLogById({
      refId,
    });

    if (callHistory?.messages.length > 0) {
      if (shouldSlice) {
        callHistory.messages.slice(-5).forEach((m) => {
          mainHistory.push({
            role: m.entity_type === "agent" ? "system" : "user",
            parts: [{ text: m.content }],
          });
        });
      } else {
        callHistory.messages.forEach((m) => {
          mainHistory.push({
            role: m.entity_type === "agent" ? "system" : "user",
            parts: [{ text: m.content }],
          });
        });
      }

      // add current user requets to mainHistoiry
      if (user_input)
        mainHistory.push({ role: "user", parts: [{ text: user_input }] });
    }

    return mainHistory;
  }

  // ANTI_THEFT call log sentiment analysis.
  public async determineATLogSentimentAnalysis(refId: string) {
    const transcript = await this.getCallLogHistory(refId, "", false);
    const variations = getSentimentVariations("ANTI_THEFT", true);
    const analysis = await this.geminiService.functionCall({
      prompt: transcript,
      tools: [
        {
          func_name: "analyze_call_sentiment",
          description: `
            <context>
              Analyze the provided phone call transcript between an agent and a user. Evaluate the overall sentiment focusing on anti-theft concerns. Determine if the call appears safe, suspicious, spam or neutral.

              Important: If no transcript is provided, or if the transcript is incomplete (missing caller name, reason for the call, or source of the phone number), automatically categorize this as a Spam call.


              Potential Red Flags:
              2. Caller avoids saying who they are or how they got the number
              3. Unexpected offers for business or money
              5. Asking for personal details or bank information
              6. Caller's story doesn't add up or changes
              7. Trying to make you feel guilty, scared, or too excited

              Indicators of Normal Calls:
              1. Caller readily provides identification when asked either (their name, or why they called)
              2. Clear, consistent reason for the call.
              4. Willingness to be called back or provide additional verification
              5. Call relates to expected business or personal matters

              Instructions:
              1. Carefully read the entire transcript.
              2. Identify key phrases or behaviors indicating the call's nature.
              3. Provide sentiment assessments for positive, neutral, and negative categories.
              4. Choose the most appropriate sentiment variation for each category.
              5. Assign confidence levels that sum to exactly 100 across all three categories.
              6. If the transcript is unclear, reflect this in the confidence levels.

              Sentiment Variations:
              ${variations}
            </context>
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              sentiment: {
                type: "string",
                description: "The specific sentiment variation chosen",
              },
              // @ts-ignore
              type: {
                type: "string",
                description:
                  "The category of sentiment: negative|positive|neutral",
              },
              // @ts-ignore
              confidence: {
                type: "number",
                description: "Confidence level (0-100).",
              },
              // @ts-ignore
              suggested_action: {
                type: "string",
                description:
                  "Provide a clear, human-readable action or series of steps based on the sentiment analysis. Be specific and practical. Multiple steps can be included if necessary.",
              },
              // @ts-ignore
              identified_red_flags: {
                type: "string",
                description:
                  "List any identified red flags from the conversation. An array of strings would be needed: ['red-flags', 'red-flags']. Be very short and concise and straight to the point, use simple words. If possible, use one or two words. List min 3 potential red flags.",
              },
            },
          },
          required: [
            "sentiment",
            "type",
            "confidence",
            "suggested_action",
            "identified_red_flags",
          ],
        },
      ],
    });

    return analysis.data;
  }

  // SALES_ASSISTANT call log sentiment analysis.
  public async determineSALogSentimentAnalysis(refId: string) {
    const transcript = await this.getCallLogHistory(refId, "", false);
    const variations = getSentimentVariations("SALES_ASSISTANT", true);
    const analysis = await this.geminiService.functionCall({
      prompt: transcript,
      tools: [
        {
          func_name: "analyze_call_sentiment",
          description: `
            <context>
              Analyze the provided phone call transcript between a sales agent and a potential customer. Evaluate the overall sentiment focusing on sales opportunities and customer engagement. Determine if the call appears promising, neutral, or challenging for a sale.

              Important: If no transcript is provided, or if the transcript is incomplete categorize this as a Low Priority lead.


              Positive Indicators:
              1. Customer shows interest in products, services, or additional information
              2. Caller asks relevant questions about offerings or the company
              3. Customer expresses a desire to book an appointment or follow up
              4. Caller seems satisfied with the information provided
              5. The conversation flows smoothly with good engagement
              6. Customer expresses interest in making a purchase or booking a service
              7. Caller provides contact information for follow-up

              Instructions:
              1. Carefully read the entire transcript.
              2. Identify key phrases or behaviors indicating the call's nature and potential.
              3. Provide sentiment assessments for positive, neutral, and negative categories.
              4. Choose the most appropriate sentiment variation for each category from the provided list.
              5. Assign confidence levels that sum to exactly 100 across all three categories.
              6. If the transcript is unclear or incomplete, reflect this in the confidence levels.
              7. Suggest a general follow-up strategy or next step based on the call's outcome.

              Sentiment Variations:
              ${variations}
            </context>
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              sentiment: {
                type: "string",
                description: "The specific sentiment variation chosen",
              },
              // @ts-ignore
              type: {
                type: "string",
                description:
                  "The category of sentiment: negative|positive|neutral",
              },
              // @ts-ignore
              confidence: {
                type: "number",
                description: "Confidence level (0-100).",
              },
              // @ts-ignore
              suggested_action: {
                type: "string",
                description:
                  "Provide a clear, human-readable action or series of steps based on the sentiment analysis. Be specific and practical. Multiple steps can be included if necessary.",
              },
              // @ts-ignore
              identified_red_flags: {
                type: "string",
                description:
                  "List any identified red flags from the conversation. An array of strings would be needed: ['red-flags', 'red-flags']. Be very short and concise and straight to the point, use simple words. If possible, use one or two words. List min 3 potential red flags.",
              },
            },
          },
          required: [
            "sentiment",
            "type",
            "confidence",
            "suggested_action",
            "identified_red_flags",
          ],
        },
      ],
    });

    return analysis.data;
  }

  private async getAgentForwardedNumber(agent_id: string) {
    const userFowardedNum = await prisma.forwardingNumber.findFirst({
      where: {
        agentId: agent_id,
      },
    });

    return userFowardedNum?.phone ?? null;
  }

  private async notifyCallee(
    callerPhone: string,
    calleePhone: string,
    purchasedNumber: string
  ) {
    const smsSent = await redis.get(`${callerPhone}_sms_sent`);
    if (!smsSent) {
      const template = `A call was made recently, click the link below to get more information. ${env.CLIENT_URL}/call-logs`;
      await this.bgJobService.publishJob({
        type: "send-sms",
        data: {
          from: purchasedNumber,
          to: calleePhone,
          message: template,
        },
      });
      const exp = 10 * 60; // 10min
      await redis.set(`${callerPhone}_sms_sent`, "true");
      await redis.expire(`${callerPhone}_sms_sent`, exp);
    } else {
      logger.info("SMS already sent");
    }
  }

  private async processAntiTheftRequest(
    props: IHandleConversationProps
  ): Promise<ProcessAIRequestResponse> {
    const { user_input, agent_info, cached_conv_info } = props;
    const [callLogEntry, forwardedNum] = await Promise.all([
      this.callLogService.getCallLogEntry({
        refId: cached_conv_info.callRefId,
      }),
      this.getAgentForwardedNumber(agent_info.agent_id),
    ]);
    const _callerName = callLogEntry?.callerName ?? null;
    const _callReason = callLogEntry?.callReason ?? null;
    const _referral = callLogEntry?.referral ?? null;
    const _message = callLogEntry?.message ?? null;

    await this.notifyCallee(
      cached_conv_info.callerPhone,
      forwardedNum ?? cached_conv_info.calledPhone,
      cached_conv_info.calledPhone
    );

    if (!_callerName) {
      logger.info("Extracting caller name");
      const resp = await this.getCallerName(user_input);
      const followUp = resp[0]?.args?.follow_up_response;
      const callerNameExtracted = resp[0]?.args?.caller_name;

      if (
        followUp &&
        ["null", "unknown", "undefined"].includes(callerNameExtracted)
      ) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          followUp
        );
        return { msg: followUp };
      }
      if (!["null", "unknown"].includes(callerNameExtracted)) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          callerNameExtracted
        );

        await this.callLogService.addCallLogEntry({
          refId: cached_conv_info.callRefId,
          callerName: callerNameExtracted,
        });

        return { msg: followUp };
      }
    }
    if (!_message) {
      logger.info("Extracting caller intent message");
      const resp = await this.getCallerMessage(user_input, _callerName);
      const followUp = resp[0]?.args?.follow_up;
      const intentExtracted = resp[0]?.args?.message;

      if (followUp && ["null", "unknown"].includes(intentExtracted)) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          followUp
        );
        return { msg: followUp };
      }
      if (!["null", "unknown"].includes(intentExtracted)) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          intentExtracted
        );

        await this.callLogService.addCallLogEntry({
          refId: cached_conv_info.callRefId,
          message: intentExtracted,
        });

        return { msg: followUp };
      }
    }
    if (!_callReason) {
      logger.info("Extracting caller reason");
      const resp = await this.getCallReason(user_input, _callerName);
      const followUp = resp[0]?.args?.follow_up;
      const callReasonExtracted = resp[0]?.args?.reason;

      if (followUp && ["null", "unknown"].includes(callReasonExtracted)) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          followUp
        );
        return { msg: followUp };
      }
      if (!["null", "unknown"].includes(callReasonExtracted)) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          callReasonExtracted
        );

        await this.callLogService.addCallLogEntry({
          refId: cached_conv_info.callRefId,
          callReason: callReasonExtracted,
        });

        return { msg: followUp };
      }
    }
    if (!_referral) {
      logger.info("Extracting caller referral");
      const resp = await this.getCallReferral(
        user_input,
        _callerName,
        _callReason
      );
      const followUp = resp[0]?.args?.follow_up;
      const referralExtracted = resp[0]?.args?.referral;

      if (followUp && ["null", "unknown"].includes(referralExtracted)) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          followUp
        );
        return { msg: followUp };
      }
      if (!["null", "unknown"].includes(referralExtracted)) {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          referralExtracted
        );

        await this.callLogService.addCallLogEntry({
          refId: cached_conv_info.callRefId,
          referral: referralExtracted,
        });

        return { msg: followUp, ended: true };
      }
    }
    const genAiResp = await this.geminiService.callAI({
      user_prompt: user_input,
      instruction: antiTheftInstructionPrompt,
    });

    await this.processCallLog(
      cached_conv_info,
      agent_info,
      user_input,
      genAiResp.data
    );

    return { msg: genAiResp.data };
  }

  private async processSalesAssistantRequest(
    props: IHandleConversationProps
  ): Promise<ProcessAIRequestResponse> {
    const { user_input, agent_type, agent_info, cached_conv_info } = props;
    let resp: ProcessAIRequestResponse = {
      msg: "",
      ended: false,
      escallated: { number: null },
    };

    const [agent, mainHistory, callIntent, similarities] = await Promise.all([
      prisma.agents.findFirst({
        where: { id: agent_info.agent_id, userId: agent_info.user_id },
        select: { name: true },
      }),
      this.getCallLogHistory(cached_conv_info.callRefId, user_input, true),
      this.determineSAIntent(user_input),
      this.vectorSimilaritySearch({
        agent_id: agent_info.agent_id,
        data_source_ids: cached_conv_info.kb_ids,
        user_input,
      }),
    ]);

    console.log({
      agent,
      mainHistory,
      callIntent,
      similarities: similarities.length,
    });

    if (!agent?.name || !callIntent || similarities.length === 0) {
      resp.msg = `I'm sorry, I couldn't understand that, please try again.`;
      return resp;
    }

    const agentName = agent.name;
    const closestMatch = similarities
      .slice(0, 2)
      .map((d) => d.content)
      .join("\n");
    const systemInstruction = salesAssistantInstructionPrompt({
      agent_name: agentName,
      data_source: closestMatch.trim(),
      user_input,
      history: mainHistory,
    });

    const aiResp = await this.geminiService.callAI({
      instruction: systemInstruction,
      user_prompt: user_input,
    });

    const aiMsg =
      aiResp.data ?? "I'm sorry, I couldn't understand that, please try again.";

    console.log(callIntent);
    console.log(aiResp.data);

    if (callIntent.length > 0) {
      const intent = callIntent.find((f) => f.name === "determine_call_intent")
        ?.args?.action;

      const forwardedNum = await this.getAgentForwardedNumber(
        agent_info.agent_id
      );
      await this.notifyCallee(
        cached_conv_info.callerPhone,
        forwardedNum ?? cached_conv_info.calledPhone,
        cached_conv_info.calledPhone
      );

      switch (intent) {
        case "GREETINGS":
        case "ENQUIRY":
          resp.msg = aiMsg;
          await this.processCallLog(
            cached_conv_info,
            agent_info,
            user_input,
            aiMsg
          );
          return resp;

        case "APPOINTMENT":
          const integration =
            await this.integrationService.getIntegrationByAgentId(
              agent_info.agent_id
            );
          const bookingIntegration = integration.find(
            (i) => i.type == "google_calendar"
          );

          if (integration.length === 0 || !bookingIntegration) {
            resp.msg =
              "I'm sorry, I'm unable to book an appointment at the moment. Please try again later.";
            await this.processCallLog(
              cached_conv_info,
              agent_info,
              user_input,
              resp.msg
            );
            return resp;
          }

          // send the booking link to the user
          const bookingLink = bookingIntegration.url;
          await this.bgJobService.publishJob({
            type: "send-sms",
            data: {
              from: cached_conv_info.calledPhone,
              to: cached_conv_info.callerPhone,
              message: `Here is the link to book an appointment: ${bookingLink}`,
            },
          });

          const followUp = `Got it, a link would be sent to this number shortly. Any other request?`;
          await this.processCallLog(
            cached_conv_info,
            agent_info,
            user_input,
            followUp
          );
          resp.msg = followUp;
          return resp;

        case "CALL_ESCALATION":
        case "HANDOVER":
          const agent = await prisma.agents.findFirst({
            where: { id: agent_info.agent_id },
            select: { forwarding_number: true },
          });

          if (!agent.forwarding_number) {
            resp.msg = `I'm sorry, I'm unable to transfer your call at the moment. How may I assist you further?`;
          } else {
            resp.msg = "Noted, your call would be transferred shortly.";
            resp.escallated.number = agent.forwarding_number.phone;
          }

          await this.processCallLog(
            cached_conv_info,
            agent_info,
            user_input,
            resp.msg
          );
          return resp;

        case "GOODBYE":
          resp.ended = true;
          resp.msg = aiMsg;
          await this.processCallLog(
            cached_conv_info,
            agent_info,
            user_input,
            aiMsg
          );
          return resp;

        default:
          resp.msg =
            "I'm sorry, I couldn't find any information on that. Please try again.";
          await this.processCallLog(
            cached_conv_info,
            agent_info,
            user_input,
            resp.msg
          );
          return resp;
      }
    } else {
      resp.msg =
        "I'm sorry, I couldn't find any information on that. Please try again.";
      await this.processCallLog(
        cached_conv_info,
        agent_info,
        user_input,
        resp.msg
      );
      return resp;
    }
  }

  // handle telegram customer support request
  public async handleTelegramCustomerSupportRequest(data: {
    agentId: string;
    groupId?: string;
    userMessage: string;
    senderName: string;
  }) {
    let response = { error: null, success: null, data: null } as {
      error: null | string;
      success: string | null;
      data: {
        aiResp: string | null;
      } | null;
    };

    const { agentId, groupId } = data;
    const tgHelper = new TelegramHelper();
    const agent = await prisma.agents.findFirst({
      where: { id: agentId },
      select: { name: true, userId: true, id: true, integrations: true },
    });

    if (!agent) {
      response.error = "Agent not found";
      return response;
    }

    const agentName = agent.name;

    const knowledgebase = await prisma.knowledgeBase.findMany({
      where: {
        userId: agent.userId,
      },
      include: {
        linked_knowledge_base: {
          select: {
            kb_id: true,
            agentId: true,
          },
        },
      },
    });

    const data_source_ids = [];

    for (const kb of knowledgebase) {
      const linked_kb = kb.linked_knowledge_base.find(
        (d) => d.agentId === agent.id
      );
      if (linked_kb) data_source_ids.push(linked_kb.kb_id);
    }

    const [_, similarities] = await Promise.all([
      tgHelper.storeTelegramGroupHistory({
        groupId,
        content: data.userMessage,
        sender: data?.senderName ?? "user",
      }),
      this.vectorSimilaritySearch({
        user_input: data.userMessage,
        data_source_ids,
        agent_id: data.agentId,
      }),
    ]);

    const closestMatch = similarities
      .slice(0, 2)
      .map((d) => d.content)
      .join("\n");

    const agentIntegration = agent.integrations;
    const bookingIntegration = agentIntegration.find(
      (i) => i.type === "google_calendar"
    );
    const history = await tgHelper.getTelegramGroupHistoryText(groupId!);
    const systemInstruction = generalCustomerSupportTemplatePrompt({
      agentName,
      context: closestMatch.trim(),
      query: `${data.senderName ?? "user"}: ${data.userMessage}`,
      history,
      integration: {
        booking_page: bookingIntegration?.url,
      },
    });

    const aiResp = await this.geminiService.callAI({
      instruction: systemInstruction,
      user_prompt: data?.userMessage!,
    });

    const telegramBotName = "@usenexusai_bot";
    const aiMsg = aiResp.data;

    // replace any @agent word with the agent's name
    const aiMsgWithBotName = aiMsg.replace(/@agent/, telegramBotName);
    console.log({ aiMsgWithBotName });

    // save the conversation
    await tgHelper.storeTelegramGroupHistory({
      groupId,
      content: aiMsg,
      sender: "@agent",
    });

    response.success = "Request processed successfully";
    response.data = { aiResp: aiMsgWithBotName };
    return response;
  }
}
