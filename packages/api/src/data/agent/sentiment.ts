const SENTIMENT_ANALYSIS_VARIATIONS = {
  positive: {
    "ANTI-THEFT": [
      "Caller Verified Safely",
      "No Issues Detected",
      "Call Deemed Safe",
    ],
    SALES_ASSISTANT: [
      "Excellent Customer Interaction",
      "Helpful Assistant Interaction",
      "Satisfied with Call",
      "Satisfactory Service",
    ],
  },
  negative: {
    "ANTI-THEFT": [
      "Suspicious Caller Identified",
      "Potential Scam Call",
      "Possible Fraudulent Activity",
      "Suspicious Call Behavior",
      "Untrusted Caller Warning",
      "Potential Threatening Call",
    ],
    SALES_ASSISTANT: [
      "Unsatisfactory Service",
      "Disappointed with Call",
      "Poor Customer Service",
      "Spam Call Alert",
      "Scammer Warning",
      "Unsatisfactory Experience",
    ],
  },
  neutral: {
    "ANTI-THEFT": [
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
