export type ConvSignupPayload = {
  email?: string;
  name?: string;
  country_code?: string;
  state?: string;
  city?: string;
};

export type CreateConversationPayload = {
  agent_id: string;
};
