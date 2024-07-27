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

const TwilioSubPlanInfo = {
  local: {
    name: "Local",
    description: "Local phone numbers are specific to a city or region.",
    product: {
      test_id: 318984, // IN DEV MODE
      prod_id: 318978, // PROD MODE
    },
    variant: {
      test_id: 463694, // IN DEV MODE
      prod_id: 463687, // IN PROD MODE
    },
  },
} as TwilioSubPlanInfo;

export default TwilioSubPlanInfo;
