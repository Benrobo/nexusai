// Agents internal config

import type { DefaultIntents } from "../../types/agent.types";

export const AGENT_NAME = "Cassie";
export const defaultAgentName = "Nexus";

export const DEFAULT_CALL_INTENTS = [
  "EMERGENCY",
  "GREETINGS",
  "REQUEST",
  "GOODBYE",
  "FURTHER_REQUEST",
  "HANDOVER",
  "CALL_ESCALATION",
] satisfies DefaultIntents[];

// SALES ASSISTANT
export const DEFAULT_SA_CALL_INTENTS = [
  "GREETINGS",
  "ENQUIRY",
  "APPOINTMENT",
  "FURTHER_REQUEST",
  "HANDOVER",
  "CALL_ESCALATION",
] satisfies DefaultIntents[];
