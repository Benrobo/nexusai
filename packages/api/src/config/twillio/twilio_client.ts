import twilio from "twilio";

const twClient = (acctSID: string, authToken: string) =>
  twilio(acctSID, authToken);

export default twClient;
