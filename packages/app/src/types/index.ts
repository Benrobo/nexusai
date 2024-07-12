export type ResponseData = {
  errorStatus: boolean;
  message: string;
  code: string;
  statusCode: number;
  data?: any;
  error?: {
    message: string;
    error: any;
  };
};

export type UserInfo = {
  full_name: string;
  username: string;
  email: string;
  avatar: string;
  id: string;
  role: string;
};

export interface IAgents {
  id: string;
  userId: string;
  name: string;
  type: string;
  contact_number: string;
  dial_code: string;
  country: string;
  welcome_message: string;
  seed_phrase: string;
  custom_prompt: string;
  created_at: string;
}

export type AgentActiveTabs =
  | "general"
  | "integrations"
  | "protected-numbers"
  | "settings"
  | "appearance"
  | "knowledge-base";

export type AgentType = "ANTI_THEFT" | "SALES_ASSISTANT" | "CHATBOT";

export type KBType = "TXT" | "WEB_PAGES" | "PDF" | "YT_VIDEOS" | "NOTION";

export type ConversationsData = {
  id: string;
  messages: {
    id: string;
    account: {
      id: string;
      name: string;
      avatar: string;
    };
    role: "conversation_account" | "admin" | "agent";
    content: string;
    escalated?: {
      date: string;
    };
    date: string;
  }[];
};
