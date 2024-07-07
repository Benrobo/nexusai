import type { AgentType, TwilioIncomingCallVoiceResponse } from "types";

export interface IncomingCallParams extends TwilioIncomingCallVoiceResponse {}

export type InitConvRestProps = {
  agent_type: AgentType;
  agent_id: string;
  user_id: string;
  caller: string;
  callSid: string;
};

export type ProvisioningPhoneNumberProps = {
  user_id: string;
  subscription_id: string;
  phone_number: string;
  agent_id: string;
};

export type ConvVoiceCallCacheInfo = {
  callerPhone: string;
  calledPhone: string;
  callRefId: string;
  state: string;
  country_code: string;
  zipcode: string;
  kb_ids?: string[];
};
