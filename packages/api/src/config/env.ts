import dotenv from "dotenv";
dotenv.config();

const IN_DEV = process.env.NODE_ENV === "development";

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:4000",
  API_URL: process.env.API_URL || "http://localhost:4001/api",
  MAIL_FROM: process.env.MAIL_FROM!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URI!,
  // GOOGLE GEMINI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  TWILIO: {
    // test account
    TEST_ACCT_SID: process.env.TW_TEST_ACCT_SID!,
    TEST_AUTH_TOKEN: process.env.TW_TEST_AUTH_TOKEN!,

    // production account
    ACCT_SID: process.env.TWILIO_ACCOUNT_SID!,
    AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,

    PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER!,
    TWILIO_AREA_CODE: process.env.TWILIO_AREA_CODE!,

    // AUTOMATED_CUSTOMER_SUPPORT AND ANTI_THEFT (AGENT SPECIFIC NUMBER)
    DEFAULT_PHONE_NUMBER: process.env.TWILIO_DEFAULT_NUMBER!,
    AUTOMATED_CUSTOMER_SUPPORT_NUMBER: process.env.TWILIO_ACSUP_NUMBER!,

    // WEBHOOK
    WH_VOICE_URL: IN_DEV
      ? "https://0853-102-88-69-136.ngrok-free.app/api/webhook/twilio/voice"
      : process.env.TWILIO_WH_VOICE_URL!,
  },
  LS: {
    STORE_ID: process.env.LS_STORE_ID!,
    API_KEY: process.env.LS_API_KEY!,
    WH_SECRET: process.env.LS_WH_SECRET!,
  },
};

export default env;
