// Varieties of TwiMl Voice Response
// Basically controls what twiml says based on specific conditions

import { AGENT_NAME } from "../../data/agent/config.js";

type TypeResponse =
  | "CALLED_PHONE_NOT_FOUND"
  | "NO_AGENT_AVAILABLE"
  | "KNOWLEDGE_BASE_NOT_FOUND"
  | "AGENT_NOT_LINKED"
  | "INIT_ANTI_THEFT"
  | "INIT_SALES_ASSISTANT"
  | "INACTIVE_AGENT"; // if agent isn't activated

interface TwiMlResponse {
  type: TypeResponse;
  msg: string;
}

export const twimlPrompt = [
  {
    type: "CALLED_PHONE_NOT_FOUND",
    msg: `Hi, the number you are trying to reach is not available at the moment. Please try again later, Thank you.`,
  },
  {
    // This happen when users purchase
    type: "NO_AGENT_AVAILABLE",
    msg: `Hi, I'm currently unable to assist you. Please try again later. Thank you for your understanding.`,
  },
  {
    // This happen when users purchase
    type: "INACTIVE_AGENT",
    msg: `Hi, I'm currently unable to assist you. Please try again later. Thank you for your understanding.`,
  },
  {
    // This happen when users purchase phone number, create an agent without adding any knowledge base
    type: "KNOWLEDGE_BASE_NOT_FOUND",
    msg: `Hi, I would love to assist you, but I don't have the necessary information right now. Please try again later. Thank you for your understanding.`,
  },
  {
    // This happen when users purchase phone number, create an agent without linking the phone number
    type: "AGENT_NOT_LINKED",
    msg: `Hi, I'm currently unable to assist you. Please try again later. Thank you for your understanding.`,
  },
  {
    type: "INIT_ANTI_THEFT",
    msg: `Hi, it ${AGENT_NAME}, here to help. Who's calling?`,
  },
  {
    type: "INIT_SALES_ASSISTANT",
    msg: `Hi, you've reached {{agent_name}}. How can I help you today?`,
  },
  {
    type: "INIT_SALES_ASSISTANT",
    msg: `Hi, you've reached {{agent_name}}. How can I help you today?`,
  },
] as TwiMlResponse[];
