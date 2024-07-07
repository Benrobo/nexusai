import type { Sentiment } from "@/components/sentiment-analysis/chart";
import type { AgentType } from ".";

export type CallLogsResponseData = {
  id: string;
  refId: string;
  agentId: string;
  userId: string;
  from_number: string;
  to_number: string;
  caller_country: string;
  caller_state: string;
  zip_code: string;
  created_at: Date;
  agent: {
    id: string;
    name: string;
    type: AgentType;
  };
  messages: {
    id: string;
    call_log_id: string;
    fromId: string;
    toId: string;
    entity_type: string;
    content: string;
    created_at: Date;
  }[];
  logEntry: {
    id: string;
    callReason: string | null;
    callerName: string;
    referral: string | null;
    message: string | null;
  };
  analysis: {
    id: string;
    sentiment: string;
    suggested_action: string;
    confidence: number;
    type: Sentiment;
    red_flags: string;
  } | null;
};
