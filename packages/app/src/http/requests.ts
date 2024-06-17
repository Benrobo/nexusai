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
