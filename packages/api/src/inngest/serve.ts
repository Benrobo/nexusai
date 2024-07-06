import { serve } from "inngest/express";
import inngestConf from "./client.js";
import smsFn from "./functions/sendSms.function.js";

export const inngestServe = serve({
  client: inngestConf,
  functions: [smsFn],
});
