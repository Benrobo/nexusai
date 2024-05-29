import {
  FlexColCenter,
  FlexColStart,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Brain, ShieldCheck, UnPlug } from "@/components/icons";
import useSession from "@/hooks/useSession";
import { AgentType, AgentEnum } from "@nexusai/shared/types";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Button from "@/components/ui/button";
import Modal from "@/components/Modal";
import { useState } from "react";
import { cn, formatPhoneNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SUPPORTED_COUNTRIES from "@nexusai/shared/config/supported-countries";

dayjs.extend(relativeTime);

interface IagentType {
  type: AgentType;
  title: string;
  desc: string;
  img: string;
}

const agentTypes = [
  {
    type: "ANTI_THEFT",
    title: "Anti-theft",
    img: "/assets/images/anti-theft-system.svg",
    desc: "Protect your phone numbers from scammers.",
  },
  {
    type: "AUTOMATED_CUSTOMER_SUPPORT",
    title: "Automated Customer Support",
    img: "/assets/images/help-desk.svg",
    desc: "Automate your customer support with AI.",
  },
  {
    type: "CHATBOT",
    title: "Chatbot",
    img: "/assets/images/chatbot.svg",
    desc: "Provides 24/7 chatbot for your business.",
  },
] satisfies IagentType[];

export default function Agents() {
  const [steps, setSteps] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(
    "ANTI_THEFT"
  );
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState({
    dial_code: "+1",
    number: "",
    country: "US",
  });

  const shouldDisableBtn = () => {
    if (steps === 1 && !selectedAgent) return true;
    if (steps === 2) {
      if (!agentName || agentName.length === 0) return true;
      if (
        ["AUTOMATED_CUSTOMER_SUPPORT", "ANTI_THEFT"].includes(selectedAgent!)
      ) {
        if (
          !agentPhone.number ||
          agentPhone.number.length === 0 ||
          agentPhone.number.split(" ").join("").length !== 10
        )
          return true;
      }
    }
    return false;
  };

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
      <br />

      {/* agents */}
      <FlexRowStart className="w-full px-10 py-5 ">
        <AgentCard
          name="Baaymax"
          date={new Date()}
          type="ANTI_THEFT"
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

      {/* create agent modal */}
      <Modal
        onClose={() => setOpenModal(false)}
        isBlurBg
        isOpen={openModal}
        fixed={false}
      >
        <FlexColStart className="w-full min-w-[400px] h-full bg-white-300 rounded-[22px] p-1">
          <FlexColStart className="w-full bg-white-100 rounded-[20px]">
            <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
              <FlexColCenter className="w-auto border-[2px] border-white-400 rounded-full p-1 relative">
                <img
                  src={`https://api.dicebear.com/8.x/bottts/svg?seed=${name}`}
                  className="rounded-full scale-[.90]"
                  alt={"agent-avatar"}
                  width={30}
                  height={30}
                />
              </FlexColCenter>

              <FlexColStart className="w-full gap-1">
                <h1 className="font-ppM font-bold text-lg">Create Agent</h1>
                <p className="text-xs font-ppReg font-light text-gray-500">
                  Create a new agent to handle your customer support, block
                  scammers.
                </p>
              </FlexColStart>
            </FlexRowStart>

            {/* Agent types */}
            {steps === 1 && (
              <FlexColStart className="w-full px-5 py-3">
                {agentTypes.map((t, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-full h-auto flex flex-row gap-4 items-center justify-start px-4 py-3 rounded-xl bg-white-100 border-[2px] border-white-300",
                      selectedAgent === t.type
                        ? "border-[2px] border-dark-105 bg-white-300"
                        : "border-white-300"
                    )}
                    onClick={() => setSelectedAgent(t.type)}
                  >
                    <img src={t.img} alt={"anti-scam"} width={30} height={30} />
                    <FlexColStart className="w-full gap-1">
                      <h1 className="text-xs font-ppB font-light text-dark-100">
                        {t.title}
                      </h1>
                      <p className="text-[10px] font-ppReg font-light text-white-400">
                        {t.desc}
                      </p>
                    </FlexColStart>
                  </button>
                ))}
              </FlexColStart>
            )}

            {/* input form */}
            {steps === 2 && (
              <FlexColStart className="w-full px-5 py-3 gap-1">
                <label className="text-xs font-jb text-white-400">
                  Agent name
                </label>
                <Input
                  type="text"
                  placeholder="Name"
                  className="w-full h-[40px] bg-white-100 rounded-xl px-3 border-[1px] border-dark-100 outline outline-[1px] outline-white-300 font-ppReg text-xs placeholder:text-white-400/50"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  maxLength={15}
                />

                {["AUTOMATED_CUSTOMER_SUPPORT", "ANTI_THEFT"].includes(
                  selectedAgent!
                ) && (
                  <FlexColStart className="w-full gap-0 mt-3">
                    <label className="text-xs font-jb text-white-400">
                      Contact Number
                    </label>
                    <FlexRowStartCenter className="w-full border-[1px] border-dark-100 rounded-xl mt-1 gap-0 overflow-hidden">
                      <Select className="p-0 m-0">
                        <SelectTrigger className="w-[100px] rounded-none outline-none border-none border-r-[1px] border-r-dark-100 ring-0 focus:ring-0 shadow-none font-ppReg text-xs ">
                          <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_COUNTRIES.map((c, idx) => (
                            <SelectItem key={idx} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="w-full max-w-[35px] h-[40px] flex flex-col items-center justify-center text-white-400/70 text-xs font-jb font-light border-l-[1px] border-l-dark-100 px-1 ml-3 ">
                        +1
                      </div>
                      <Input
                        type="text"
                        placeholder="444 435 9990"
                        className="w-full h-[40px] bg-none outline-none border-none rounded-none px-0 font-jb text-xs"
                        value={agentPhone.number}
                        maxLength={12}
                        onChange={(e) =>
                          setAgentPhone({
                            ...agentPhone,
                            number: formatPhoneNumber(e.target.value),
                          })
                        }
                      />
                    </FlexRowStartCenter>
                  </FlexColStart>
                )}
              </FlexColStart>
            )}

            {/* integrations */}

            {/* Next and prev button */}
            <FlexRowStartBtw className="w-full px-5 py-2 mb-2">
              <Button
                className="w-auto text-xs h-[30px] bg-dark-100 rounded-md hover:bg-dark-100/80"
                onClick={() => setSteps(steps - 1)}
                disabled={steps === 1}
              >
                Back
              </Button>
              <Button
                className="w-auto text-xs h-[30px] bg-dark-100  rounded-md hover:bg-dark-100/80"
                size={"sm"}
                onClick={() => {
                  steps < 2 && setSteps(steps + 1);

                  // create agent
                }}
                disabled={shouldDisableBtn()}
              >
                {steps === 2 ? "Create Agent" : "Next"}
              </Button>
            </FlexRowStartBtw>
          </FlexColStart>
        </FlexColStart>
      </Modal>
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
                height={30}
              />
              <span className="w-[20px] h-[20px] flex flex-col items-center justify-center text-xs rounded-full absolute -bottom-2 right-[-5px] bg-white-100 border-[2px] border-white-400">
                {type === "ANTI_THEFT"
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
        {type === "ANTI_THEFT" && (
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
