import twilio from "twilio";
import env from "../env.js";

const twClient = twilio(env.TWILIO.ACCT_SID, env.TWILIO.AUTH_TOKEN);

export default twClient;
