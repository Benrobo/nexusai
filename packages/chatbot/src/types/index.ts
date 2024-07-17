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

export type AccountInfo = {
  id: string;
  name: string;
  email: string;
  country_code: string | null;
  city: string | null;
  state: string | null;
  verified: boolean;
};

export type AgentType = "ANTI_THEFT" | "SALES_ASSISTANT" | "CHATBOT";

export type ChatBotAgentConfig = {
  brand_color: string;
  text_color: string;
  name: string;
  type: AgentType;
};

type AccountRoles = "admin" | "customer" | "agent";

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
  chatbot_config: {
    brand_color: string;
    text_color: string;
    agent_id: string;
  }[];
}

export interface IConversationMessages {
  conv_id: string;
  admin_in_control: boolean;
  messages: {
    agent_id: string;
    message: string;
    date: string;
    sender: {
      id: string;
      name: string;
      avatar: string;
      role: AccountRoles;
    };
  }[];
  customer_info: {
    name: string;
    email: string;
    country_code: string | null;
    city: string | null;
    state: string | null;
  };
}
