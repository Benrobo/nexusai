const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3030",
  API_URL: process.env.API_URL || "http://localhost:3050/api",
  LEMONSQUEEZY_API_KEY: process.env.LEMONSQUEEZY_API_KEY,
  LEMONSQUEEZY_WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET,
  MAIL_FROM: process.env.MAIL_FROM!,
};

export default env;
