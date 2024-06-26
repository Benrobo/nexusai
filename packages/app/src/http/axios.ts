import env from "@/config/env";
import axios from "axios";

// api url
const API_URL = env.API_URL;

// custom axios instance with necessary details
const $axios = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // to allow cookies
  timeout: 60000, // 60 seconds
});

export default $axios;
