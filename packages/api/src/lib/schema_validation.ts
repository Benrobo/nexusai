import zod from "zod";

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

// waitlist
export const addToWaitlistSchema = zod.object({
  email: zod
    .string({
      required_error: "Email is required",
    })
    .email()
    .regex(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    ),
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
