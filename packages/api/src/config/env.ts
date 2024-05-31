import dotenv from "dotenv";
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:4000",
  API_URL: process.env.API_URL || "http://localhost:4001/api",
  MAIL_FROM: process.env.MAIL_FROM!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URI!,
  TWILIO: {
    ACCT_SID: process.env.TWILIO_ACCOUNT_SID!,
    AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,
    PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER!,
    TWILIO_AREA_CODE: process.env.TWILIO_AREA_CODE!,
  },
};

export default env;
