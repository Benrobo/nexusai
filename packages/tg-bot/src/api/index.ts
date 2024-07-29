import axios from "axios";
import env from "../config/env.js";
import type { AIReqProps } from "../types/telegram.type.js";

const API_URL = env.API_URL;

const $axios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000,
});

export default $axios;

export const getAIResponse = async (props: AIReqProps) => {
  const { data } = await $axios.post(
    "/conversation/process/integration/tg-bot",
    {
      ...props,
    }
  );

  return data;
};
