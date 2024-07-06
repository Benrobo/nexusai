type HMTypeAlias = NexusMainFunction["data"];
type ResponseType = SendSms<HMTypeAlias>;

export type Events = {
  "nexus/send-sms": ResponseType;
};

// sendSMS function type
export type SendSms<T extends NexusMainFunction["data"]> = {
  data: T & {
    from: string;
    to: string;
    data: string;
  };
};

// All other function would inherit their types properties from.
type NexusMainFunction = {
  data: {
    userId: string;
  };
};
