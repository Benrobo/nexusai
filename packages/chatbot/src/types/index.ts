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

export type ChatBotConfig = {
  brand_color: string;
  text_color: string;
  agent_id: string;
  brand_name: string;
  welcome_message: string;
  suggested_questions: string;
};

export type AccountInfo = {
  id: string;
  name: string;
  email: string;
  country_code: string | null;
  city: string | null;
  state: string | null;
  verified: boolean;
  chatbotConfig: ChatBotConfig | null;
};

export type AgentType = "ANTI_THEFT" | "SALES_ASSISTANT" | "CHATBOT";

export type ChatBotAgentConfig = {
  brand_color: string;
  text_color: string;
  name: string;
  type: AgentType;
};

export type AccountRoles = "admin" | "customer" | "agent";

export interface IConversations {
  conversations: {
    id: string;
    agentId: string;
    created_at: string;
    conversationAccountId: string;
    admin_in_control: boolean;
    lastMsg: {
      message: string;
      date: string;
      sender: {
        id: string;
        fullname?: string;
        name?: string;
        avatar?: string;
        email?: string;
        role: AccountRoles;
      };
    };
  }[];
  unread_messages: {
    conv_id: string;
    unread: number;
  }[];
}

export interface IConversationMessages {
  admin_in_control: boolean;
  messages: {
    agent_id: string | null;
    message: string | null;
    date: string | null;
    sender: {
      id: string | null;
      name?: string | null;
      fullname?: string | null;
      avatar?: string | null;
      role: AccountRoles;
    };
  }[];
}
