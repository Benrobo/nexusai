import type { NewBotConfigData } from "@/pages/agents/selected-agent/appearance";
import $axios from "./axios";

export const signInUser = async (data: any) => {
  const resp = await $axios.post("/auth/otp-auth", data);
  return resp.data;
};

export const login = async (data: any) => {
  const resp = await $axios.post("/auth/login", data);
  return resp.data;
};

export const getUser = async () => {
  const req = await $axios.get("/user");
  return req.data;
};

// get agents
export const getAgents = async () => {
  const req = await $axios.get("/agents");
  return req.data;
};

export const getAgent = async (id: string) => {
  const req = await $axios.get(`/agent/${id}`);
  return req.data;
};

export const getChatbotConfig = async (id: string) => {
  const req = await $axios.get(`/agent/chatbot-config/${id}`);
  return req.data;
};

export const updateChatbotConfig = async (
  data: NewBotConfigData & { agent_id: string }
) => {
  const req = await $axios.patch(`/agent/chatbot-config`, data);
  return req.data;
};

export const getAgentSettings = async (id: string) => {
  const req = await $axios.get(`/agent/settings/${id}`);
  return req.data;
};

export const activateAgent = async (id: string) => {
  const req = await $axios.patch(`/agent/activate/${id}`);
  return req.data;
};

export const updateAgentSettings = async (data: any) => {
  const req = await $axios.patch(`/agent/settings`, data);
  return req.data;
};

export const createAgent = async (data: any) => {
  const req = await $axios.post("/agent", data);
  return req.data;
};

export const getVerifiedNumbers = async () => {
  const req = await $axios.get("/agent/verified-numbers");
  return req.data;
};

export const sendOTP = async (phone: string, agent_id: string) => {
  const req = await $axios.post(`/agent/send-otp/${agent_id}`, { phone });
  return req.data;
};

export const verifyPhone = async (data: any) => {
  const req = await $axios.post("/agent/verify-phone", data);
  return req.data;
};

export const getAgentFwdNumber = async (id: string) => {
  const req = await $axios.get(`/agent/forward-number/${id}`);
  return req.data;
};

export const getAgentPhoneNumbers = async (id: string) => {
  const req = await $axios.get(`/agent/active-number/${id}`);
  return req.data;
};

export const getTwAvailableNumbers = async () => {
  const req = await $axios.get(`/agent/tw/available-numbers`);
  return req.data;
};

/* Flow: BuyNumber -> getCheckoutUrl */
export const buyPhoneNumber = async (data: any) => {
  const req = await $axios.post(`/checkout/tw-phone/buy`, data);
  return req.data;
};

export const getCheckoutUrl = async () => {
  const req = await $axios.get(`/checkout/tw-phone`);
  return req.data;
};
/* End of flow */

export const addKnowledgeBase = async (data: any) => {
  const req = await $axios.post("/knowledge-base", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return req.data;
};

export const crawlWebpage = async (data: any) => {
  const req = await $axios.post("/knowledge-base/crawl-page", data);
  return req.data;
};

export const getKnowledgeBase = async (id: string) => {
  const req = await $axios.get(`/knowledge-base/${id}`);
  return req.data;
};

export const getAllKnowledgeBase = async () => {
  const req = await $axios.get(`/knowledge-base`);
  return req.data;
};

export const linkKnowledgeBase = async (data: any) => {
  const req = await $axios.post(`/knowledge-base/link`, data);
  return req.data;
};

export const retrainKbData = async (data: any) => {
  const req = await $axios.post(`/knowledge-base/retrain`, data);
  return req.data;
};

export const deleteKnowledgeBase = async (data: {
  agent_id: string;
  kb_id: string;
}) => {
  const req = await $axios.delete(
    `/knowledge-base/${data.agent_id}/${data.kb_id}`
  );
  return req.data;
};

export const unlinkKnowledgeBase = async (data: any) => {
  const req = await $axios.post(`/knowledge-base/unlink`, data);
  return req.data;
};

export const addIntegration = async (data: any) => {
  const req = await $axios.post(`/agent/integration`, data);
  return req.data;
};

export const getIntegration = async (id: string) => {
  const req = await $axios.get(`/agent/integration/${id}`);
  return req.data;
};

export const deleteIntegration = async (agent_id: string, int_id: string) => {
  const req = await $axios.delete(`/agent/integration/${agent_id}/${int_id}`);
  return req.data;
};

// Call Logs
export const getCallLogs = async (page: number, limit: number) => {
  const req = await $axios.get(`/call-logs?page=${page}&limit=${limit}`);
  return req.data;
};

export const getUnreadLogs = async () => {
  const req = await $axios.get(`/call-logs/unread`);
  return req.data;
};

export const markLogAsRead = async (id: string) => {
  const req = await $axios.patch(`/call-logs/mark-read/${id}`);
  return req.data;
};

export const getCallLogAnalysis = async (id: string) => {
  const req = await $axios.get(`/call-logs/analysis/${id}`);
  return req.data;
};

export const deleteCallLog = async (id: string) => {
  const req = await $axios.delete(`/call-logs/${id}`);
  return req.data;
};

// CONVERSATION
export const getConversations = async (page?: number, limit?: number) => {
  const req = await $axios.get(
    `/conversations/admin?page=${page}&limit=${limit}`
  );
  return req.data;
};

export const getConversationMessages = async (id: string) => {
  const req = await $axios.get(`/conversation/messages/admin/${id}`);
  return req.data;
};

export const switchConversationControl = async (id: string) => {
  const req = await $axios.patch(`/conversation/switchControl/${id}`);
  return req.data;
};

export const replyToConversation = async (data: {
  id: string;
  response: string;
}) => {
  const req = await $axios.post(
    `/conversation/process/${data.id}`,
    { response: data.response },
    { headers: { "x-nexus-admin-account": true } }
  );
  return req.data;
};

export const markConversationRead = async (id: string) => {
  const req = await $axios.patch(
    `/conversation/mark-read/${id}`,
    {},
    {
      headers: { "x-nexus-admin-account": true },
    }
  );
  return req.data;
};

export const deleteConversation = async (id: string) => {
  const req = await $axios.delete(`/conversation/${id}`, {
    headers: { "x-nexus-admin-account": true },
  });
  return req.data;
};

export const getIntegrationConfig = async (
  int_id: string,
  agent_id: string
) => {
  const req = await $axios.get(`/agent/integration/${int_id}/${agent_id}`);
  return req.data;
};

export const rotateIntegrationConfigToken = async (
  int_id: string,
  agent_id: string
) => {
  const req = await $axios.patch(
    `/agent/integration/rotate-token/${int_id}/${agent_id}`
  );
  return req.data;
};

export const getCustomerGrowthStats = async () => {
  const req = await $axios.get(`/user/metrics/customer-growth`);
  return req.data;
};

export const getTotalConversations = async () => {
  const req = await $axios.get(`/user/metrics/conversations`);
  return req.data;
};

export const getTotalKnowledgeBase = async () => {
  const req = await $axios.get(`/user/metrics/knowledgebase`);
  return req.data;
};

export const getTotalAIMessagesMetrics = async () => {
  const req = await $axios.get(`/user/metrics/ai-messages`);
  return req.data;
};

export const getTotalAgents = async () => {
  const req = await $axios.get(`/user/metrics/agents`);
  return req.data;
};

export const getCallLogSentimentAnalysis = async () => {
  const req = await $axios.get(`/user/call-logs/sentiment`);
  return req.data;
};

export const getConversationSentimentAnalysis = async () => {
  const req = await $axios.get(`/user/conversation/sentiment`);
  return req.data;
};

export const getConversationMessagesSentimentAnalysis = async (id: string) => {
  const req = await $axios.get(`/user/conversation/${id}/sentiment`);
  return req.data;
};

export const getCustomerPortal = async (product_id: string) => {
  const req = await $axios.get(`/agent/subscription/portal/${product_id}`);
  return req.data;
};

export const getAgentSubscription = async (agent_id: string) => {
  const req = await $axios.get(`/agent/subscription/${agent_id}`);
  return req.data;
};

export const deleteAgent = async (id: string) => {
  const req = await $axios.delete(
    `/agent/${id}?tid=${Math.floor(Math.random() * 10000)}`
  );
  return req.data;
};
