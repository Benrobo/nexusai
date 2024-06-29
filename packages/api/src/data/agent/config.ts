// Agents internal config

import type { DefaultIntents } from "../../types/agent.types";

export const AGENT_NAME = "Cassie";

export const DEFAULT_CALL_INTENTS = [
  "EMERGENCY",
  "GREETINGS",
  "REQUEST",
  "GOODBYE",
  "FURTHER_REQUEST",
  "HANDOVER",
  "CALL_ESCALATION",
] satisfies DefaultIntents[];
