import { FlexColStart, FlexRowStart, FlexRowStartBtw } from "@/components/Flex";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
      <FlexColStart className="w-full h-full max-w-[300px] border-r-[.5px] border-r-white-400/30 px-3 py-5">
        <FlexColStart className="w-full gap-1">
          <p className="text-sm font-ppB text-dark-100">Chatbot Appearance</p>
          <p className="text-xs font-ppReg text-white-400">
            Customize your chatbot appearance to match your brand.
          </p>
        </FlexColStart>

        <br />
        <FlexColStart className="w-full gap-1">
          <p className="text-sm font-ppM text-dark-100">Brand name</p>
          <Input className="" placeholder="Cassie" />
        </FlexColStart>
        <FlexColStart className="w-full gap-1 mt-2">
          <p className="text-sm font-ppM text-dark-100">Welcome message</p>
          <Input className="" placeholder="How can i help you?" />
        </FlexColStart>

        {/* brand identity */}
        <FlexColStart className="w-full gap-1 mt-7">
          <p className="text-sm font-ppM text-dark-100">Brand Identity</p>
          <FlexColStart className="w-full gap-4">
            <FlexRowStartBtw className="w-full">
              <p className="text-xs font-ppM text-white-400">Brand color</p>
              <button
                className={cn(
                  "w-[20px] h-[20px] rounded-full bg-dark-100 enableBounceEffect"
                )}
              ></button>
            </FlexRowStartBtw>
            <FlexRowStartBtw className="w-full">
              <p className="text-xs font-ppM text-white-400">Text color</p>
              <button
                className={cn(
                  "w-[20px] h-[20px] rounded-full bg-dark-100 enableBounceEffect"
                )}
              ></button>
            </FlexRowStartBtw>
          </FlexColStart>
        </FlexColStart>

        {/* suggested questions */}
        <FlexColStart className="w-full gap-1 mt-7">
          <p className="text-sm font-ppM text-dark-100">
            Suggested questions (optional)
          </p>
          <label className="text-xs font-ppReg text-white-400">
            Questions separated by comma (,)
          </label>
          <Input
            className=""
            placeholder="Question 1? Question 2? Question 3?"
          />
        </FlexColStart>

        {/* controls */}
        <Button
          className="w-full max-w-[80px] h-[35px] font-ppReg text-xs bg-brown-100 text-white-100 rounded-md mt-5 disabled:bg-brown-100/50 disabled:text-white-100"
          intent={"dark"}
          disabled={true}
        >
          Save
        </Button>
      </FlexColStart>
    </FlexRowStart>
  );
}
