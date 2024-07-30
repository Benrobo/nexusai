import dotenv from "dotenv";
dotenv.config();

const IN_DEV = process.env.NODE_ENV === "development";

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:4000",
  API_URL: process.env.API_URL || "http://localhost:4001/api",
  MAIL_FROM: process.env.MAIL_FROM!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URI!,
  TG: {
    BOT_TOKEN: process.env.TG_BOT_TOKEN!,
    WH_URL: process.env.TG_WH_URL!,
  },
  // GOOGLE GEMINI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  TWILIO: {
    // test account
    TEST_ACCT_SID: process.env.TW_TEST_ACCT_SID!,
    TEST_AUTH_TOKEN: process.env.TW_TEST_AUTH_TOKEN!,

    // production account
    ACCT_SID: process.env.TWILIO_ACCOUNT_SID!,
    AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN!,

    TWILIO_AREA_CODE: process.env.TWILIO_AREA_CODE!,

    // SALES_ASSISTANT AND ANTI_THEFT (AGENT SPECIFIC NUMBER)
    DEFAULT_PHONE_NUMBER1: process.env.TWILIO_DEFAULT_NUMBER1!,
    DEFAULT_PHONE_NUMBER2: process.env.TWILIO_DEFAULT_NUMBER2!,
    AUTOMATED_CUSTOMER_SUPPORT_NUMBER: process.env.TWILIO_ACSUP_NUMBER!,

    // WEBHOOK
    WH_VOICE_URL: IN_DEV
      ? process.env.TWILIO_WH_VOICE_URL!
      : process.env.TWILIO_WH_VOICE_URL!,
  },
  LS: {
    STORE_ID: process.env.LS_STORE_ID!,
    API_KEY: process.env.LS_API_KEY!,
    WH_SECRET: process.env.LS_WH_SECRET!,
  },
  CF: {
    AUTH_TOKEN: process.env.CF_AUTH_TOKEN!,
    ACCT_ID: process.env.CF_ACCT_ID!,
  },
  TTS: {
    XI_LAB_API_KEY: process.env.XI_LAB_API_KEY!,
  },
  FIREBASE: {
    API_KEY: process.env.FIREBASE_API_KEY!,
    AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN!,
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
    STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET!,
    MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID!,
    APP_ID: process.env.FIREBASE_APP_ID!,
    MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID!,
  },
  NEXUS_CRON_TOKEN: process.env.NEXUS_CRON_TOKEN!,
  QSTASH: {
    TOKEN: process.env.QSTASH_TOKEN!,
  },
};

export default env;
