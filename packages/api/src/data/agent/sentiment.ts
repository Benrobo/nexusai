import type { AgentType } from "../../types/index.js";

const SENTIMENT_ANALYSIS_VARIATIONS = {
  positive: {
    ANTI_THEFT: [
      "Caller Verified Safely",
      "No Issues Detected",
      "Call Deemed Safe",
    ],
    SALES_ASSISTANT: [
      "Excellent Customer Interaction",
      "Helpful Assistant Interaction",
      "Satisfied with Call",
      "Satisfactory Service",
      "Enthusiastic Customer",
      "Interested Prospect",
      "Positive Call Experience",
      "Satisfied Caller",
      "Engaged Potential Client",
      "Promising Sales Opportunity",
    ],
  },
  negative: {
    ANTI_THEFT: [
      "Suspicious Caller Identified",
      "Potential Scam Call",
      "Possible Fraudulent Activity",
      "Suspicious Call Behavior",
      "Untrusted Caller Warning",
      "Potential Threatening Call",
      "Potential Spam Call",
    ],
    SALES_ASSISTANT: [
      "Unsatisfactory Service",
      "Disappointed with Call",
      "Poor Customer Service",
      "Spam Call Alert",
      "Scammer Warning",
      "Unsatisfactory Experience",
      "Dissatisfied Customer",
      "Frustrated Caller",
      "Negative Experience",
      "Unhappy Prospect",
      "Disappointed Caller",
      "Irritated Customer",
    ],
  },
  neutral: {
    ANTI_THEFT: [
      "No Significant Activity",
      "Neutral Call Feedback",
      "Average Customer Interaction",
    ],
    SALES_ASSISTANT: [
      "Inquiry Received",
      "General Question Handled",
      "Neutral Call Feedback",
      "Standard Service Provided",
      "Average Customer Interaction",
    ],
  },
};

export default SENTIMENT_ANALYSIS_VARIATIONS;

export function getSentimentVariations(
  agent_type: AgentType,
  md_form?: boolean
) {
  const positive = SENTIMENT_ANALYSIS_VARIATIONS.positive[
    agent_type!
  ] as string[];
  const negative = SENTIMENT_ANALYSIS_VARIATIONS.negative[
    agent_type!
  ] as string[];
  const neutral = SENTIMENT_ANALYSIS_VARIATIONS.neutral[
    agent_type!
  ] as string[];

  if (md_form) {
    const mainTxt = `
## Positive variations:
${positive.join("\n")}

## Negative variations:
${negative.join("\n")}

## Neutral variations:
${neutral.join("\n")}
    `;
    return mainTxt;
  }

  return {
    positive,
    negative,
    neutral,
  };
}
