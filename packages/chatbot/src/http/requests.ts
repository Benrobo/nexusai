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
