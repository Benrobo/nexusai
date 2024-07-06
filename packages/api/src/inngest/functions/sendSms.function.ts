import inngestConf from "../client.js";

const smsFn = inngestConf.createFunction(
  {
    id: "send-sms",
    onFailure: async ({ error, event, step }) => {
      console.error(error);
    },
  },
  { event: "nexus/send-sms" },
  async ({ event, step }) => {
    const e_data = event.data;
  }
);

export default smsFn;
