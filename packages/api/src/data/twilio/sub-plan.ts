// Twilio Subscription Plans

type TwilioSubPlan = "local" | "toll-free";
type TwilioSubPlanInfo = {
  [key in TwilioSubPlan]: {
    name: string;
    description: string;
    product: {
      test_id: number;
      prod_id: number;
    };
    variant: {
      test_id: number;
      prod_id: number;
    };
    recommended: boolean;
    supported: boolean;
  };
};

// 3 days grace period max to resubscribe if payment fails
export const GRACE_PERIOD_DAYS = 3;

const TwilioSubPlanInfo = {
  local: {
    name: "Local",
    description: "Local phone numbers are specific to a city or region.",
    product: {
      test_id: 292219, // IN DEV MODE
      prod_id: 292219,
    },
    variant: {
      test_id: 417672, // IN DEV MODE
      prod_id: 417672,
    },
  },
} as TwilioSubPlanInfo;

export default TwilioSubPlanInfo;
