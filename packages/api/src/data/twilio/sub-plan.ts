// Twilio Subscription Plans

type TwilioSubPlan = "local" | "toll-free";
type TwilioSubPlanInfo = {
  [key in TwilioSubPlan]: {
    name: string;
    description: string;
    product_id: number;
    variant_id?: number;
    recommended: boolean;
    supported: boolean;
  };
};

const TwilioSubPlanInfo = {
  local: {
    name: "Local",
    description: "Local phone numbers are specific to a city or region.",
    product_id: 292219,
    variant_id: 417672,
    recommended: true,
    supported: true,
  },
} as TwilioSubPlanInfo;

export default TwilioSubPlanInfo;
