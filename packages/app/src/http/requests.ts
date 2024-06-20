import $axios from "./axios";

export const signInUser = async (data: any) => {
  const resp = await $axios.post("/auth/otp-auth", data);
  return resp.data;
};

export const login = async (data: any) => {
  const resp = await $axios.post("/auth/login", data);
  return resp.data;
};

// fetch users info
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

export const getAgentSettings = async (id: string) => {
  const req = await $axios.get(`/agent/settings/${id}`);
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

export const sendOTP = async (data: any) => {
  const req = await $axios.post("/agent/send-otp", data);
  return req.data;
};

export const verifyPhone = async (data: any) => {
  const req = await $axios.post("/agent/verify-phone", data);
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

export const getKnowledgeBase = async (id: string) => {
  const req = await $axios.get(`/knowledge-base/${id}`);
  return req.data;
};
