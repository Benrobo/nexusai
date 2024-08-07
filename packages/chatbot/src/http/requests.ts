import $axios from "./axios";

export const getChatbotConfig = async (agent_id: string) => {
  const resp = await $axios.get(`/agent/chatbot-config/${agent_id}`);
  return resp.data;
};

export const signUpUser = async (data: any) => {
  const resp = await $axios.post("/user/chat-widget-account/signup", data);
  return resp.data;
};

export const signInUser = async (data: any) => {
  const resp = await $axios.post("/user/chat-widget-account/signin", data);
  return resp.data;
};

export const verifyAccount = async (data: any) => {
  const resp = await $axios.patch("/user/chat-widget-account/verify", data);
  return resp.data;
};

export const getAccountInfo = async (agentId: string) => {
  const resp = await $axios.get(`/user/chat-widget-account/${agentId}`);
  return resp.data;
};

export const logoutAccount = async () => {
  const resp = await $axios.post("/user/chat-widget-account/logout");
  return resp.data;
};

export const getConversations = async (agentId: string) => {
  const resp = await $axios.get(`/conversations/widget-account/${agentId}`);
  return resp.data;
};

export const getConvMessages = async (data: {
  convId: string;
  agent_id: string;
}) => {
  const resp = await $axios.get(
    `/conversations/widget-account/${data.agent_id}/${data.convId}`
  );
  return resp.data;
};

export const startNewConversation = async (agent_id: string) => {
  const resp = await $axios.post("/conversation", { agent_id });
  return resp.data;
};

export const sendUserQuery = async (data: { id: string; query: string }) => {
  const req = await $axios.post(
    `/conversation/process/${data.id}`,
    { query: data.query },
    { headers: { "x-nexus-widget-account": true } }
  );
  return req.data;
};

export const processLastUserQuery = async (conversation_id: string) => {
  const req = await $axios.post(
    `/conversation/process/last-query/${conversation_id}`,
    { headers: { "x-nexus-widget-account": true } }
  );
  return req.data;
};

export const requestHumanSupport = async (data: {
  conversation_id: string;
  agent_id: string;
}) => {
  const req = await $axios.post(
    `/conversation/human-support/${data.agent_id}/${data.conversation_id}?tid=${Math.random() * 100000}`
  );
  return req.data;
};

export const deleteAccount = async () => {
  const req = await $axios.delete(`/user/chat-widget-account`);
  return req.data;
};
