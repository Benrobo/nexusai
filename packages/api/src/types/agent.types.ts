export type DefaultIntents =
  | "EMERGENCY"
  | "ENQUIRY"
  | "GREETINGS"
  | "REQUEST"
  | "GOODBYE"
  | "FURTHER_REQUEST"
  | "CALL_ESCALATION"
  | "HANDOVER";

export type FunctionCallingNames = "determine_call_intent";

export interface IFunctionCallResp {
  name: FunctionCallingNames;
  args: {
    action: DefaultIntents;
  };
}
