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
import { Prisma } from "@prisma/client";
import retry from "../lib/retry.js";

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

export default class AIService {
  private geminiService = new GeminiService();
  private callLogService = new CallLogsService();
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

  private async determineSAIntentAndFollowUpResponse(
    user_msg: string,
    system_instruction: string,
    call_history?: string
  ) {
    const intentCallResp = await this.geminiService.functionCall({
      prompt: `
        <UserMessage>${user_msg}</UserMessage>

        <CallHistory>
            ${call_history ?? "N/A"}
        </CallHistory>

        First, identify the call intent. Then, construct a follow-up response. Make sure the follow up message is available in your response, it is a MUST.
      `,
      tools: [
        {
          func_name: "follow_up_response",
          description: `Construct a follow-up response from users message and the data source given.
            `,
          parameters: {
            type: "object",
            properties: {
              // @ts-expect-error
              message: {
                type: "string",
                description: `
                ## Context
                ${system_instruction}
                
                Construct a follow-up response from users message or enquiry from the context given. If the  context is irrelivant to the user message, you can construct a response using your intuition. Make sure it meaningful and relevant to the user.
                `,
              },
            },
          },
          required: ["message"],
        },
        {
          func_name: "determine_call_intent",
          description: `Identify call intent or action from the given prompt. Actions must be returned in one word, all caps, and underscored Note: the action can only be one of the following:
          ${DEFAULT_SA_CALL_INTENTS.join(", ")}.

          <UserPrompt>${user_msg}</UserPrompt>

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

  private async getChatHistoryTxt(refId: string, user_input: string) {
    let mainHistory = "";

    const callHistory = await this.callLogService.getCallLogById({
      refId,
    });

    if (callHistory?.messages.length > 0) {
      callHistory.messages.slice(-5).forEach((m) => {
        mainHistory += `\n[${m.entity_type}]: ${m.content}\n`;
      });

      // add current user requets to mainHistoiry
      mainHistory += `\n[user]: ${user_input}\n`;
    }

    return mainHistory;
  }

  // Process ANTI-THEFT request
  private async processAntiTheftRequest(props: IHandleConversationProps) {
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

  // process SALES-ASSISTANT request
  private async processSalesAssistantRequest(props: IHandleConversationProps) {
    const { user_input, agent_type, agent_info, cached_conv_info } = props;
    let resp = { msg: "", ended: false };

    const agent = await prisma.agents.findFirst({
      where: { id: agent_info.agent_id, userId: agent_info.user_id },
      select: { name: true },
    });

    const agentName = agent.name;

    const mainHistory = await this.getChatHistoryTxt(
      cached_conv_info.callRefId,
      user_input
    );

    // perform a similarity search with the vector
    const similarities = await this.vectorSimilaritySearch({
      agent_id: agent_info.agent_id,
      data_source_ids: cached_conv_info.kb_ids, // knowleedge base id's
      user_input,
    });

    // get the content and embeddings of closest search within the returned result
    const closestMatch = similarities
      .slice(0, 2)
      .map((d) => d.content)
      .join("\n");

    const systemInstruction = salesAssistantInstructionPrompt({
      agent_name: agentName,
      data_source: closestMatch.trim(),
      user_input,
    });

    const callIntent = await this.determineSAIntentAndFollowUpResponse(
      user_input,
      systemInstruction,
      mainHistory
    );

    console.log(callIntent);

    if (callIntent.length > 0) {
      const intent = callIntent.find((f) => f.name === "determine_call_intent")
        ?.args?.action;

      if (intent === "ENQUIRY") {
        const followUp =
          callIntent.find((f) => f.name === "follow_up_response")?.args
            ?.message ??
          "I'm sorry, I couldn't understand or find any information on that. How else can I help you?.";

        await this.processCallLog(
          cached_conv_info,
          agent_info,
          user_input,
          followUp
        );

        resp.msg = followUp;
        return resp;
      }

      if (intent === "APPOINTMENT") {
      }

      return resp;
    } else {
      resp.msg =
        "I'm sorry, I couldn't find any information on that. Please try again.";
      return resp;
    }
  }
}
