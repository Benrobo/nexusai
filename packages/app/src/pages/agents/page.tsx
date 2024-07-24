import {
  FlexColCenter,
  FlexColStart,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Brain, ShieldCheck, UnPlug } from "@/components/icons";
import { AgentType } from "@/types";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Button from "@/components/ui/button";
import { useEffect, useState } from "react";
import CreateAgent from "@/components/agents/create-agent";
import { useQuery } from "@tanstack/react-query";
import { getAgents } from "@/http/requests";
import toast from "react-hot-toast";
import type { ResponseData } from "@/types";
import { Spinner } from "@/components/Spinner";
import { formatNumber } from "@/lib/utils";
import TooltipComp from "@/components/TooltipComp";

dayjs.extend(relativeTime);

interface IAgents {
  id: string;
  name: string;
  date: Date;
  type: AgentType;
  protected_numbers?: {
    id: string;
    phone: string;
    dial_code: string;
    country: string;
  }[];
  integrations?: number;
  contact_number?: string;
  created_at: Date;
  used_number: {
    phone?: string;
    country?: string;
  };
}

export default function Agents() {
  const [openModal, setOpenModal] = useState(false);
  const [agents, setAgents] = useState<IAgents[]>([]);
  const getAgentsQuery = useQuery({
    queryKey: ["agents"],
    queryFn: async () => await getAgents(),
  });

  useEffect(() => {
    if (getAgentsQuery.error) {
      console.log(getAgentsQuery.error);
      const msg =
        (getAgentsQuery.error as any)?.response?.data?.message ||
        "An error occurred";
      toast.error(msg);
    }

    if (getAgentsQuery.data) {
      const resp = getAgentsQuery.data as ResponseData;
      const agents: IAgents[] = [];
      resp.data.forEach((a: IAgents) => {
        if (a.type === "ANTI_THEFT") {
          agents.unshift(a);
        } else {
          agents.push(a);
        }
      });
      setAgents(agents);
    }
  }, [getAgentsQuery]);

  return (
    <FlexColStart className="w-full relative">
      {/* header */}
      <FlexColStart className="w-full px-10 py-5 mt-5">
        <h1 className="text-3xl font-ppB font-bold">Agents</h1>
        <p className="text-sm font-ppReg text-gray-500">
          Access all agents created under your account and manage their
          configurations and settings.
        </p>
        <Button
          className="w-auto text-xs h-[30px] bg-dark-100 hover:bg-dark-100/80"
          size={"sm"}
          onClick={() => setOpenModal(true)}
        >
          Create Agent
        </Button>
      </FlexColStart>
      {/* agents */}
      <FlexRowStart className="w-full px-5 py-5 flex-wrap">
        {getAgentsQuery.isPending ? (
          <FlexColCenter className="w-full h-full">
            <Spinner size={20} color="#000" />
          </FlexColCenter>
        ) : agents.length > 0 ? (
          agents.map((a, idx) => {
            return (
              <AgentCard
                key={idx}
                name={a.name}
                date={a.created_at}
                type={a.type}
                contact_number={a.used_number?.phone}
                integrations={a.integrations}
                id={a.id}
                active_number={a.used_number?.phone}
              />
            );
          })
        ) : (
          <FlexColCenter className="w-full h-full">
            <p className="text-xs font-ppReg text-white-400">
              No agents created yet
            </p>
          </FlexColCenter>
        )}
      </FlexRowStart>

      {/* create agent modal */}
      <CreateAgent
        setOpenModal={setOpenModal}
        openModal={openModal}
        agents={agents}
        refetch={() => {
          getAgentsQuery.refetch();
        }}
      />
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
  id: string;
  active_number?: string;
}

function AgentCard({
  name,
  date,
  type,
  contact_number,
  integrations,
  id,
}: IAgentCardProps) {
  return (
    <FlexColStart className="w-full max-w-[350px] pt-4 rounded-md outline outline-[.5px] outline-white-400/80">
      <Link
        to={`/agents/${id}?tab=settings`}
        className="flex flex-col items-start justify-start w-full"
      >
        <FlexRowStartBtw className="w-full px-6 ">
          <FlexRowStart>
            <FlexColCenter className="w-auto border-[2px] border-white-400 rounded-full p-1 relative">
              <img
                src={`https://api.dicebear.com/8.x/bottts/svg?seed=${name}`}
                className="rounded-full scale-[.90]"
                alt={"agent-avatar"}
                width={30}
                height={30}
              />
              <span className="w-[20px] h-[20px] flex flex-col items-center justify-center text-xs rounded-full absolute -bottom-2 right-[-5px] bg-white-100 border-[2px] border-white-400">
                {type === "ANTI_THEFT"
                  ? "🚨"
                  : type === "SALES_ASSISTANT"
                    ? "🧠"
                    : "🔌"}
              </span>
            </FlexColCenter>
            <FlexColStart className="w-auto gap-0 ml-2">
              <h1 className="text-sm font-ppM text-dark-100">{name}</h1>
              <span className="text-[10px] font-ppReg font-light text-white-400">
                {dayjs(date).format("MMM DD, YYYY")}
              </span>
            </FlexColStart>
          </FlexRowStart>

          {/* type */}
          <span className="text-[9px] font-jb font-medium text-white-100 px-2 py-1 rounded-sm bg-dark-100">
            {type}
          </span>
        </FlexRowStartBtw>
      </Link>
      <FlexRowStartBtw className="w-full mt-3 pt-3 pb-2 border-t-[1px] border-t-white-400/20 px-6 ">
        {/* anti-scam section */}
        {/* {type === "ANTI_THEFT" && (
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
        )} */}

        <FlexRowStartCenter className="w-auto gap-0">
          {type === "ANTI_THEFT" ? (
            <ShieldCheck size={15} className="stroke-green-100 " />
          ) : (
            <Brain size={15} className="stroke-dark-100 " />
          )}
          <span className="text-xs font-jb font-medium text-dark-100 ml-2 cursor-text">
            {formatNumber(contact_number!)}
          </span>
        </FlexRowStartCenter>

        {/* integrations */}
        {type !== "ANTI_THEFT" && (
          <TooltipComp text={`${integrations} integrations`}>
            <FlexRowStartCenter className="w-auto gap-0">
              <UnPlug size={15} className="stroke-dark-100 " />
              <span className="w-[25px] h-[25px] border-[1px] border-dashed border-white-400 flex items-center justify-center text-xs rounded-full scale-[.80] ml-2">
                {integrations ?? 0}
              </span>
            </FlexRowStartCenter>
          </TooltipComp>
        )}
      </FlexRowStartBtw>
    </FlexColStart>
  );
}
