import { AgentEnum, KBType } from "../types/index.js";
import * as zod from "zod";

// Declare all your api server schema validations here

// registeration schema
export const loginSchema = zod.object({
  email: zod
    .string({
      required_error: "Email is required",
    })
    .email(),
  otp_code: zod
    .string({
      required_error: "OTP code is required",
    })
    .refine((data) => data.length >= 6, {
      message: "OTP code must be at least 6 characters",
    }),
});

// create checkout schema
export const createCheckoutSchema = zod.object({
  product_id: zod.number({
    required_error: "Subscription product is required",
  }),
  duration: zod.string({
    required_error: "plan duration is required",
  }),
});

// get customer portal url
export const getCustomerPortalUrlSchema = zod.object({
  product_id: zod.string({
    required_error: "Customer id is required",
  }),
});

// update user details
export const updateUserDetailsSchema = zod.object({
  username: zod
    .string({
      required_error: "Username is required",
    })
    .min(3)
    .max(50),
  email: zod
    .string({
      required_error: "Email is required",
    })
    .email(),
  full_name: zod.string({
    required_error: "Avatar is required",
  }),
});

export const emailSchema = zod.object({
  email: zod
    .string({
      required_error: "Email is required",
    })
    .email({
      message: "Invalid email",
    }),
});

// WORKSPACE SCHEMA
export const createAgentSchema = zod.object({
  name: zod
    .string({
      required_error: "Workspace name is required",
    })
    .min(3)
    .max(50),
  type: zod
    .nativeEnum(AgentEnum, {
      required_error: "Agent type is required",
    })
    .refine((data) => Object.values(AgentEnum).includes(data), {
      message: "Invalid agent type",
    }),
});

// verify US phone number
export const verifyUsPhoneSchema = zod.object({
  phone: zod
    .string({
      required_error: "Phone number is required",
    })
    .regex(/^\+1-[0-9]{3}-[0-9]{3}-[0-9]{4}$/, {
      message: "Invalid US phone number",
    })
    .refine((data) => data.startsWith("+1"), {
      message: "Phone number must start with country code +1",
    }),
});

export const VerifyOTPCode = zod.object({
  otp: zod
    .string({
      required_error: "OTP code is required",
    })
    .regex(/^[0-9]{6}$/, {
      message: "Invalid OTP code",
    }),
  agentId: zod.string({
    required_error: "Agent ID is required",
  }),
});

// add knowledge base schema
export const addKbSchema = zod.object({
  type: zod
    .nativeEnum(KBType, {
      required_error: "Knowledge base type is required",
    })
    .refine((data) => Object.values(KBType).includes(data), {
      message: "Invalid knowledge base type",
    }),
  agent_id: zod.string({
    required_error: "Agent ID is required",
  }),
});

// link agent to kb
export const linkKbSchema = zod.object({
  agent_id: zod.string({
    required_error: "Agent ID is required",
  }),
  kb_ids: zod
    .string({
      required_error: "Knowledge base ID is required",
    })
    .array(),
});

// When user clicks on "Buy Number"
// we store selected phone number in redis to be retrieve later
// when creating checkout
export const buyTwilioNumberSchema = zod.object({
  phone_number: zod
    .string({
      required_error: "Phone number is required",
    })
    .regex(/^\+1[0-9]{10}$/, {
      message: "Invalid phone number",
    }),
  agent_id: zod.string({
    required_error: "Agent ID is required",
  }),
});

export const LinkPhoneNumberSchema = zod.object({
  purchased_phone_id: zod.string({
    required_error: "Purchased phone number ID is required",
  }),

  agentId: zod.string({
    required_error: "Agent ID is required",
  }),
});

export const updateAgentSettingsSchema = zod.object({
  allow_handover: zod.boolean().optional(),
  handover_condition: zod.string().optional(),
  security_code: zod.string().max(6).min(6).optional(),
  agent_id: zod.string({
    required_error: "agent is ID required",
  }),
});

export const retrainSchema = zod.object({
  agent_id: zod.string({
    required_error: "Agent ID is required",
  }),
  kb_id: zod.string({
    required_error: "Knowledge base ID is required",
  }),
});
