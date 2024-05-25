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
