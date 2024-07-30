import axios from "axios";
import env from "../config/env.js";

const API_URL = env.API_URL;

const $axios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export default $axios;

export const getAIResponse = async ({
  agentId,
  userQuery,
  groupId,
  senderName,
}) => {
  const { data } = await $axios.post(
    "/conversation/process/integration/tg-bot",
    {
      agentId,
      userQuery,
      groupId,
      senderName,
    }
  );

  return data;
};
