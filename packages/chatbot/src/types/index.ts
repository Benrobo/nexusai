export type AgentType = "ANTI_THEFT" | "SALES_ASSISTANT" | "CHATBOT";

export type ChatBotAgentConfig = {
  brand_color: string;
  text_color: string;
  name: string;
  type: AgentType;
};
