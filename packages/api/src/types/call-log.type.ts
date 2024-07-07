import type { CallLogMsgType } from "@prisma/client";

export type CreateCallLogProps = {
  data: {
    refId: string;
    agentId: string;
    userId: string;
    caller_number: string;
    called_number: string;
    country_code: string;
    state: string;
    zipcode: string;
  };
};

export type AddCallLogMessage = {
  data: {
    refId: string;
    messages: {
      entity_type?: CallLogMsgType;
      message: string;
    }[];
  };
};
