import type { AgentType } from "@/types";

interface IagentType {
  type: AgentType;
  title: string;
  desc: string;
  img: string;
}

export const agentTypes = [
  {
    type: "ANTI_THEFT",
    title: "Anti-theft",
    img: "/assets/images/anti-theft-system.svg",
    desc: "Protect your phone numbers from scammers.",
  },
  {
    type: "SALES_ASSISTANT",
    title: "Sales Assistant",
    img: "/assets/images/help-desk.svg",
    desc: "Automate your business sales process.",
  },
  {
    type: "CHATBOT",
    title: "Chatbot",
    img: "/assets/images/chatbot.svg",
    desc: "Provides 24/7 chatbot for your business.",
  },
] satisfies IagentType[];
