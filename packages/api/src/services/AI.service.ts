import type {
  DefaultIntents,
  IFunctionCallResp,
} from "../types/agent.types.js";
import {
  DEFAULT_CALL_INTENTS,
  DEFAULT_SA_CALL_INTENTS,
} from "../data/agent/config.js";
import GeminiService from "./gemini.service.js";
import type { AgentType } from "../types/index.js";
import {
  antiTheftInstructionPrompt,
  salesAssistantInstructionPrompt,
} from "../data/agent/prompt.js";
import type { ConvVoiceCallCacheInfo } from "../types/twilio-service.types.js";
import CallLogsService from "./call-logs.service.js";
import logger from "../config/logger.js";
import prisma from "../prisma/prisma.js";
import redis from "../config/redis.js";
import { getSentimentVariations } from "../data/agent/sentiment.js";
import IntegrationService from "./integration.service.js";

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
  constructor() {}

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

            Input: "I need to reschedule my appointment."
            Reason: "rescheduling an appointment"
            Follow-up: "I see, ${callerName}. How did you get this contact number?"

            Input: "Just calling to say hi."
            Reason: null
            Follow-up: "Hello ${callerName}. Is there a specific reason for your call today?"
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

  public async constructFollowUpMessage(msg: string) {
    const requestExtraction = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "construct_follow_up_message",
          description: `Construct a follow-up response from users message.

          for eg (follow up message):
          input: 'I just want to let {username} know i miss him.'
          output: 'Ok, I would pass that to the recipient. Do you have any other request?'

          Note: Replace {username} with the name of the user you're sending the message to if one exists or re-construct or answer user request.
          
          <UserMessage>${msg}</UserMessage>,
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              //   request_type: {
              //     type: "string",
              //     description: `The user request gotten from the prompt. The request must be returned in one word or joined with an underscored`,
              //   },
              // @ts-ignore
              follow_up_message: {
                type: "string",
                description: `The follow-up message constructed from the extracted request. The follow-up message must contain the extracted request in the message.`,
              },
            },
          },
          required: [
            // "request_type",
            "follow_up_message",
          ],
        },
      ],
    });

    return requestExtraction.data as IFunctionCallResp[];
  }

  // determine if the user needs further requests based on follow-up message
  public async determineFurtherRequest(msg: string) {
    const furtherRequest = await this.geminiService.functionCall({
      prompt: msg,
      tools: [
        {
          func_name: "determine_further_request",
          description: `Determine if the user needs further requests based on the follow-up message. The follow-up message must contain the extracted request in the message.
          
          for eg: 
          input: 'Ok, I would pass that to the recipient. Do you have any other request?'
          output: 'yes'

          Note: The output must be 'yes' or 'no' to indicate if the user has further requests or not.
          
          <UserPrompt>${msg}</UserPrompt>,
          `,
          parameters: {
            type: "object",
            properties: {
              // @ts-ignore
              further_request: {
                type: "string",
                description: `Yes or No only and nothing else.`,
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
          description: `Determine call intent from the prompt. Return action in ONE_WORD, ALL_CAPS, UNDERSCORED format.

          <Context>
          Previous conversations (if relevant):
          ${call_history ?? "N/A"}
          </Context>

          <AllowedActions>
          ${DEFAULT_SA_CALL_INTENTS.join(", ")}
          </AllowedActions>

          <UserPrompt>${user_msg}</UserPrompt>

          Instructions:
          1. Analyze the user's prompt and context.
          2. Choose ONE action from AllowedActions.
          3. Return ONLY the action word, formatted as specified.
          4. Based on the last conversation, determine the user's intent as well if necessary.
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
          city: cached_conv_info.city,
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

    let userMsgEmbedding:
      | {
          embedding: number[];
          content: string;
        }[]
      | null = null;

    const cachedEmbedding = await redis.get(user_input);

    if (!cachedEmbedding) {
      userMsgEmbedding = await this.geminiService.generateEmbedding(user_input);

      await redis.set(user_input, JSON.stringify(userMsgEmbedding));
      await redis.expire(user_input, 60 * 30); // expire in 30mins
    } else {
      userMsgEmbedding = JSON.parse(cachedEmbedding);
    }

    const embeddingsString = `[${userMsgEmbedding[0].embedding}]`;

    // convert data_source_ids to supported Postgresql array literal string
    const kbIdsArrayLiteral = `{${data_source_ids.map((id) => `"${id}"`).join(",")}}`;

    const similarities = (await prisma.$queryRaw`
      SELECT match_embeddings(
        ${embeddingsString},
        0.2,
        5,
        ${kbIdsArrayLiteral}::text[]
      )::json;
    `) satisfies SimilaritiesResult[];
    const _similarities: {
      content: string[];
      similarity: number;
      metadata: string;
    }[] = [];

    for (const sim of similarities) {
      _similarities.push({
        content: sim.match_embeddings.content,
        similarity: sim.match_embeddings.similarity,
        metadata: sim.match_embeddings.metadata,
      });
    }

    return _similarities;
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

  private async getChatHistoryTxt(
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
    const transcript = await this.getChatHistoryTxt(refId, "", false);
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
              4. Rushing to make decisions
              5. Asking for personal details or bank information
              6. Caller's story doesn't add up or changes
              7. Trying to make you feel guilty, scared, or too excited

              Indicators of Normal Calls:
              1. Caller readily provides identification when asked
              2. Clear, consistent reason for the call
              3. No pressure for immediate action
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

  // Process ANTI-THEFT request
  private async processAntiTheftRequestV1(props: IHandleConversationProps) {
    const { user_input, agent_info, cached_conv_info } = props;
    let resp = { msg: "", ended: false };

    const mainHistory = await this.getChatHistoryTxt(
      cached_conv_info.callRefId,
      user_input
    );

    const callIntent = (
      await this.determineCallIntent(user_input, mainHistory)
    ).find((f) => f.name === "determine_call_intent");

    logger.info(callIntent.args.action);

    if (["GREETINGS"].includes(callIntent.args.action)) {
      const genAiResp = await this.geminiService.callAI({
        user_prompt: user_input,
        instruction: antiTheftInstructionPrompt,
      });

      console.log(genAiResp);

      await this.processCallLog(
        cached_conv_info,
        agent_info,
        user_input,
        genAiResp.data
      );
      resp.msg = genAiResp.data;
      return resp;
    }
    if (callIntent.args.action === "REQUEST") {
      const followUp = (await this.constructFollowUpMessage(user_input)).find(
        (f) => f.name === "construct_follow_up_message"
      );
      const followUpMsg = followUp.args["follow_up_message"];

      // save data
      await this.processCallLog(
        cached_conv_info,
        agent_info,
        user_input,
        followUpMsg
      );

      resp.msg = followUpMsg;
      return resp;
    }
    if (callIntent.args.action === "FURTHER_REQUEST") {
      const furtherRequest = (
        await this.determineFurtherRequest(user_input)
      ).find((f) => f.name === "determine_further_request");

      if (furtherRequest.args["further_request"]?.toLowerCase() === "yes") {
        const aiResp = `How may i further assist you?`;
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          aiResp
        );

        //   return { msg: aiResp };
        resp.msg = aiResp;
        return resp;
      } else {
        const aiResp = `Ok, great. Thanks for reaching out. Your message has been received and will be addressed promptly.`;
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          aiResp
        );

        resp.ended = true;
        resp.msg = aiResp;
        return resp;
      }
    }
    if (callIntent.args.action === "GOODBYE") {
      const aiResp = `Ok, great. Thanks for reaching out. Your message has been received and will be addressed promptly.`;
      await this.processCallLog(
        cached_conv_info,
        agent_info,
        user_input,
        aiResp
      );

      resp.ended = true;
      resp.msg = aiResp;
      return resp;
    }
    if (
      ["HANDOVER", "CALL_ESCALATION", "EMERGENCY"].includes(
        callIntent.args.action
      )
    ) {
      //! work on this next
    }
  }

  private async processAntiTheftRequest(
    props: IHandleConversationProps
  ): Promise<ProcessAIRequestResponse> {
    const { user_input, agent_info, cached_conv_info } = props;
    const callLogEntry = await this.callLogService.getCallLogEntry({
      refId: cached_conv_info.callRefId,
    });
    const _callerName = callLogEntry?.callerName ?? null;
    const _callReason = callLogEntry?.callReason ?? null;
    const _referral = callLogEntry?.referral ?? null;
    const _message = callLogEntry?.message ?? null;

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

  // process SALES-ASSISTANT request
  private async processSalesAssistantRequest(
    props: IHandleConversationProps
  ): Promise<ProcessAIRequestResponse> {
    const { user_input, agent_type, agent_info, cached_conv_info } = props;
    let resp: ProcessAIRequestResponse = {
      msg: "",
      ended: false,
      escallated: { number: null },
    };

    const agent = await prisma.agents.findFirst({
      where: { id: agent_info.agent_id, userId: agent_info.user_id },
      select: { name: true },
    });

    const agentName = agent.name;

    const mainHistory = await this.getChatHistoryTxt(
      cached_conv_info.callRefId,
      user_input,
      true
    );

    const similarities = await this.vectorSimilaritySearch({
      agent_id: agent_info.agent_id,
      data_source_ids: cached_conv_info.kb_ids, // knowleedge base id's
      user_input,
    });

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
    const callIntent = await this.determineSAIntent(user_input);
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

      // check if any appointment was previously requested
      if (intent === "GREETINGS") {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          aiMsg
        );

        resp.msg = aiMsg;
        return resp;
      }
      if (intent === "ENQUIRY") {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          aiMsg
        );

        resp.msg = aiMsg;
        return resp;
      }
      if (intent === "APPOINTMENT") {
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
          return resp;
        }

        const followUp = `Got it, a link would be sent to this number shortly. Any other request?`;

        //! invoke the function to book an appointment

        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          followUp
        );

        resp.msg = followUp;
        return resp;
      }
      if (["CALL_ESCALATION", "HANDOVER"].includes(intent)) {
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
      }
      if (intent === "GOODBYE") {
        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          aiMsg
        );

        resp.ended = true;
        resp.msg = aiMsg;
        return resp;
      }

      return resp;
    } else {
      resp.msg =
        "I'm sorry, I couldn't find any information on that. Please try again.";
      return resp;
    }
  }
}
