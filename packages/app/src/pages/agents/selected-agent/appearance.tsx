import { FlexColStart, FlexRowStart } from "@/components/Flex";
import type { AgentType } from "@/types";

interface AppearanceProps {
  agent_id: string;
  type: AgentType;
}

export default function Appearance({ agent_id, type }: AppearanceProps) {
  if (type !== "CHATBOT") return null;

  return (
    <FlexRowStart className="w-full h-screen">
      {/* appearance sidebar */}
      <FlexColStart className="w-full h-full max-w-[300px] border-r-[.5px] border-r-white-400/30"></FlexColStart>
    </FlexRowStart>
  );
}
