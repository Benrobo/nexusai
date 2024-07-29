import dotenv from "dotenv";
dotenv.config();

const IN_DEV = process.env.NODE_ENV === "development";

const env = {
  TG_BOT_TOKEN: process.env.TG_BOT_TOKEN || "",
  API_URL: !IN_DEV ? process.env.API_URL : "http://localhost:4001/api",
};

export default env;
