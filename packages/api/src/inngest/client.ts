import { EventSchemas, Inngest } from "inngest";
import type { Events } from "../types/inngest-function.type.js";

const inngestConfig = new Inngest({
  id: "inngest-client",
  name: "nexus",
  schemas: new EventSchemas().fromRecord<Events>(),
});

export default inngestConfig;
