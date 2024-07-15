type AccountRoles = "admin" | "customer" | "agent";

export interface IConversations {
  conversations: {
    id: string;
    agentId: string;
    created_at: string;
    conversationAccountId: string;
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
  }[];
}

export interface IConversationMessages {
  messages: {
    message: string;
    date: string;
    sender: {
      id: string;
      name: string;
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
