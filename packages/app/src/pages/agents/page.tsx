import {
  FlexColCenter,
  FlexColStart,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Brain, ShieldCheck, UnPlug } from "@/components/icons";
import useSession from "@/hooks/useSession";
import { AgentType } from "@nexusai/shared/types";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Agents() {
  const data = useSession();
  return (
    <FlexColStart className="w-full">
      {/* header */}
      <FlexColStart className="w-full px-10 py-5 mt-5">
        <h1 className="text-3xl font-ppB font-bold">Agents</h1>
        <p className="text-sm font-ppReg text-gray-500">
          Access all agents created under your account and manage their
          configurations and settings.
        </p>
      </FlexColStart>
      <br />

      {/* agents */}
      <FlexRowStart className="w-full px-10 py-5 ">
        <AgentCard
          name="Baaymax"
          date={new Date()}
          type="ANTI_SCAM"
          protected_numbers={["+1 812 345 6789", "+1 555 345 6789"]}
        />

        <AgentCard
          name="Pal"
          date={new Date()}
          type="AUTOMATED_CUSTOMER_SUPPORT"
          contact_number="+1 812 489 4789"
          integrations={4}
        />
      </FlexRowStart>
    </FlexColStart>
  );
}

interface IAgentCardProps {
  name: string;
  date: Date;
  type: AgentType;
  protected_numbers?: string[];
  integrations?: number;
  contact_number?: string;
}

function AgentCard({
  name,
  date,
  type,
  protected_numbers,
  contact_number,
  integrations,
}: IAgentCardProps) {
  return (
    <FlexColStart className="w-full max-w-[380px] pt-4 rounded-md outline outline-[.5px] outline-white-400/80">
      <Link to={""} className="flex flex-col items-start justify-start w-full">
        <FlexRowStartBtw className="w-full px-6 ">
          <FlexRowStart>
            <FlexColCenter className="w-auto border-[2px] border-white-400 rounded-full p-1 relative">
              <img
                src={`https://api.dicebear.com/8.x/bottts/svg?seed=${name}`}
                className="rounded-full scale-[.90]"
                alt={"agent-avatar"}
                width={30}
              />
              <span className="w-[20px] h-[20px] flex flex-col items-center justify-center text-xs rounded-full absolute -bottom-2 right-[-5px] bg-white-100 border-[2px] border-white-400">
                {type === "ANTI_SCAM"
                  ? "🚨"
                  : type === "AUTOMATED_CUSTOMER_SUPPORT"
                    ? "🧠"
                    : "🔌"}
              </span>
            </FlexColCenter>
            <FlexColStart className="w-auto gap-0 ml-2">
              <h1 className="text-sm font-ppM text-dark-100">{name}</h1>
              <span className="text-xs font-ppReg font-light text-white-400">
                {dayjs(date).format("MMM DD, YYYY")}
              </span>
            </FlexColStart>
          </FlexRowStart>

          {/* type */}
          <span className="text-[10px] font-jb font-medium text-white-100 px-2 py-1 rounded-sm bg-dark-100">
            {type}
          </span>
        </FlexRowStartBtw>
      </Link>
      <FlexRowStartBtw className="w-full mt-3 pt-3 pb-2 border-t-[1px] border-t-white-400/20 px-6 ">
        {/* anti-scam section */}
        {type === "ANTI_SCAM" && (
          <FlexRowStartCenter className="w-auto gap-0">
            <ShieldCheck size={15} className="stroke-green-100 " />
            <span className="text-xs font-jb font-medium text-dark-100 ml-2">
              {protected_numbers?.slice(0, 1)}
            </span>
            <span className="w-[25px] h-[25px] border-[1px] border-dashed border-white-400 flex items-center justify-center text-xs rounded-full scale-[.90] ml-2">
              {protected_numbers && protected_numbers?.length > 1
                ? `+${protected_numbers?.length}`
                : protected_numbers?.length}
            </span>
          </FlexRowStartCenter>
        )}

        {/* Automated customer support */}
        {type === "AUTOMATED_CUSTOMER_SUPPORT" && contact_number && (
          <FlexRowStartCenter className="w-auto gap-0">
            <Brain size={15} className="stroke-dark-100 " />
            <span className="text-xs font-jb font-medium text-dark-100 ml-2 cursor-text">
              {contact_number}
            </span>
          </FlexRowStartCenter>
        )}

        {/* integrations */}
        <FlexRowStartCenter className="w-auto gap-0">
          <UnPlug size={15} className="stroke-dark-100 " />
          <span className="w-[25px] h-[25px] border-[1px] border-dashed border-white-400 flex items-center justify-center text-xs rounded-full scale-[.80] ml-2">
            {integrations ?? 0}
          </span>
        </FlexRowStartCenter>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}
