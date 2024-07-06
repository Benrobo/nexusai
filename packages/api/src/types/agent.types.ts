export type DefaultIntents =
  | "EMERGENCY"
  | "ENQUIRY"
  | "GREETINGS"
  | "REQUEST"
  | "GOODBYE"
  | "APPOINTMENT"
  | "FURTHER_REQUEST"
  | "CALL_ESCALATION"
  | "USER_DETAILS"
  | "HANDOVER";

export type FunctionCallingNames =
  | "determine_call_intent"
  | "follow_up_response"
  | "construct_follow_up_message"
  | "determine_further_request";

export interface IFunctionCallResp {
  name: FunctionCallingNames;
  args: {
    [key: string]: DefaultIntents | string;
  };
}
