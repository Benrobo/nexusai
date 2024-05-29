import { useEffect, useState } from "react";
import {
  FlexColCenter,
  FlexColStart,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import Button from "@/components/ui/button";
import Modal from "@/components/Modal";
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
import type { AgentType } from "@nexusai/shared/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createAgent, getVerifiedNumbers, sendOTP } from "@/http/requests";
import toast from "react-hot-toast";
import VerifyPhoneModal from "./verify-phone";
import type { ResponseData } from "@/types";
import { X } from "../icons";
import { agentTypes } from "@/data/agent";

interface ICreateAgentProps {
  setOpenModal: (value: boolean) => void;
  openModal: boolean;
  agents: {
    type: AgentType;
  }[];
  refetch: () => void;
}

interface IVerifiedNumbers {
  phone: string;
  isInUse: boolean;
  id: string;
}

export default function CreateAgent({
  setOpenModal,
  openModal,
  agents,
  refetch,
}: ICreateAgentProps) {
  const [verifiedNumbers, setVerifiedNumbers] = useState<IVerifiedNumbers[]>(
    []
  );
  const [timerStart, setTimerStart] = useState(false);
  const [verifyPhoneModal, setVerifyPhoneModal] = useState(false);
  const [steps, setSteps] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentPhone, setAgentPhone] = useState({
    dial_code: "+1",
    number: "",
    country: "US",
  });
  const createAgentMut = useMutation({
    mutationFn: async (data: any) => await createAgent(data),
    onSuccess: () => {
      setOpenModal(false);
      resetState();
      refetch && refetch();
      toast.success("Agent created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response.data.message ?? "Failed to create agent");
    },
  });
  const getVerifiedNumbersQuery = useQuery({
    queryKey: ["getVerifiedNumbers"],
    queryFn: async () => await getVerifiedNumbers(),
    enabled: openModal,
  });
  const sendOTPMut = useMutation({
    mutationFn: async (data: any) => await sendOTP(data),
    onSuccess: () => {
      setVerifyPhoneModal(true);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to send OTP.";
      toast.error(msg);
    },
  });

  const formatted_phone_num = `${agentPhone.dial_code}-${agentPhone.number.replace(/\D/g, "-")}`;

  const isPhoneNumberVerified = verifiedNumbers.find(
    (v) => v.phone === formatted_phone_num
  );

  const shouldDisableNextBtn = () => {
    if (steps === 1 && !selectedAgent) return true;
    if (steps === 2) {
      if (!agentName || agentName.length === 0) return true;
      if (
        ["AUTOMATED_CUSTOMER_SUPPORT", "ANTI_THEFT"].includes(selectedAgent!)
      ) {
        if (
          !agentPhone.number ||
          agentPhone.number.split(" ").join("").length !== 10
        )
          return true;
        if (!isPhoneNumberVerified) return true;
      }

      return false;
    }
    if (createAgentMut.isPending) return true;
    return false;
  };

  const _createAgent = () => {
    let payload = {};

    if (!agentName || agentName.length === 0) {
      toast.error("Agent name is required");
      return;
    }
    if (["AUTOMATED_CUSTOMER_SUPPORT", "ANTI_THEFT"].includes(selectedAgent!)) {
      if (
        !agentPhone.number ||
        agentPhone.number.length === 0 ||
        agentPhone.number.split(" ").join("").length !== 10
      ) {
        toast.error("Invalid phone number");
        return;
      }
    }

    if (selectedAgent === "CHATBOT") {
      payload = {
        name: agentName,
        type: selectedAgent,
        country: agentPhone.country,
      };
    } else {
      payload = {
        name: agentName,
        type: selectedAgent,
        country: agentPhone.country,
        phone: formatted_phone_num,
      };
    }

    createAgentMut.mutate(payload);
  };

  const handlePhoneVerification = () => {
    // send otp to phobne number
    sendOTPMut.mutate({
      phone: formatted_phone_num,
    });
    setTimerStart(true);
  };

  const resetState = () => {
    setSteps(1);
    setSelectedAgent(null);
    setAgentName("");
    setAgentPhone({
      dial_code: "+1",
      number: "",
      country: "US",
    });
  };

  useEffect(() => {
    // check if ANTI_THEFT agent already exists
    const agentExists = agents && agents.find((a) => a.type === "ANTI_THEFT");
    if (agentExists) {
      selectedAgent === "ANTI_THEFT" || !selectedAgent
        ? setSelectedAgent("AUTOMATED_CUSTOMER_SUPPORT")
        : null;
    }
  }, [agents, openModal]);

  useEffect(() => {
    if (getVerifiedNumbersQuery.error) {
      const msg =
        getVerifiedNumbersQuery.error?.message ||
        "Failed fetching verified numbers";
      toast.error(msg);
    }
    if (getVerifiedNumbersQuery.data) {
      const resp = getVerifiedNumbersQuery.data as ResponseData;
      const data = resp.data as IVerifiedNumbers[];
      setVerifiedNumbers(data);
    }
  }, [getVerifiedNumbersQuery, openModal]);

  return (
    <Modal isBlurBg isOpen={openModal} fixed={false}>
      <FlexColStart className="w-full min-w-[400px] h-full bg-white-300 rounded-[22px] p-1">
        <FlexColStart className="w-full bg-white-100 rounded-[20px] relative">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
            onClick={() => {
              setOpenModal(false);
              resetState();
            }}
          >
            <X size={15} color="#000" />
          </button>
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
                    "w-full h-auto flex flex-row gap-4 items-center justify-start px-4 py-3 rounded-xl bg-white-100 border-[2px] border-white-300 disabled:cursor-not-allowed disabled:opacity-[.5]",
                    selectedAgent === t.type
                      ? "border-[2px] border-dark-105 bg-white-300"
                      : "border-white-300"
                  )}
                  onClick={() => {
                    if (
                      agents?.find((a) => a.type === "ANTI_THEFT") &&
                      t.type === "ANTI_THEFT"
                    )
                      return;
                    setSelectedAgent(t.type);
                  }}
                  disabled={
                    agents
                      ? agents?.find((a) => a.type === "ANTI_THEFT") &&
                        t.type === "ANTI_THEFT"
                      : false
                  }
                >
                  <img src={t.img} alt={"anti-scam"} width={30} height={30} />
                  <FlexColStart className="w-full gap-1 relative">
                    <h1 className="text-xs font-ppB font-light text-dark-100">
                      {t.title}
                      {t.type === "ANTI_THEFT" && (
                        <span className="absolute right-10 -top-[1px] font-jb text-[10px] text-white-400">
                          1 agent (max)
                        </span>
                      )}
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
                readOnly={createAgentMut.isPending}
              />

              {["AUTOMATED_CUSTOMER_SUPPORT", "ANTI_THEFT"].includes(
                selectedAgent!
              ) && (
                <FlexColStart className="w-full gap-0 mt-3">
                  <FlexRowStartBtw className="w-full">
                    <label className="text-xs font-jb text-white-400">
                      Contact Number
                    </label>

                    {timerStart ? (
                      <Timer revert={() => setTimerStart(false)} />
                    ) : (
                      <label
                        className={cn(
                          "text-[10px] font-jb font-bold text-dark-100 underline cursor-pointer",
                          verifiedNumbers.find(
                            (v) => v.phone == formatted_phone_num
                          ) || formatted_phone_num.length < 10
                            ? "invisible"
                            : "visible"
                        )}
                        onClick={handlePhoneVerification}
                      >
                        Verify number
                      </label>
                    )}
                  </FlexRowStartBtw>
                  <FlexRowStartCenter className="w-full border-[1px] border-dark-100 rounded-xl mt-1 gap-0 overflow-hidden">
                    <Select
                      className="p-0 m-0"
                      onValueChange={(v: string) => {
                        setAgentPhone({
                          ...agentPhone,
                          country: v,
                        });
                      }}
                      defaultValue={agentPhone.country}
                    >
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
                      readOnly={createAgentMut.isPending}
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
              disabled={steps === 1 || createAgentMut.isPending}
            >
              Back
            </Button>
            <Button
              className={cn(
                "w-auto text-xs h-[30px] bg-dark-100  rounded-md hover:bg-dark-100/80",
                createAgentMut.isPending && "opacity-[.8]"
              )}
              size={"sm"}
              onClick={() => {
                steps < 2 && setSteps(steps + 1);
                steps === 2 && _createAgent();
              }}
              disabled={shouldDisableNextBtn()}
              isLoading={createAgentMut.isPending}
              spinnerColor="#000"
            >
              {steps === 2 ? "Create Agent" : "Next"}
            </Button>
          </FlexRowStartBtw>
        </FlexColStart>
      </FlexColStart>

      {/* Verify number modal */}
      <VerifyPhoneModal
        isOpen={verifyPhoneModal}
        closeModal={() => setVerifyPhoneModal(false)}
        refetchVerifiedPhone={() => {
          setTimerStart(false);
          getVerifiedNumbersQuery.refetch();
        }}
      />
    </Modal>
  );
}

const Timer = ({ revert }: { revert: () => void }) => {
  const [time, setTime] = useState(20);
  useEffect(() => {
    if (time <= 0) {
      revert();
      return;
    }
    const interval = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);
  return (
    <span className="text-[10px] font-jb font-bold text-white-400 cursor-not-allowed">
      Resend in 00:{time < 10 ? `0${time}` : time}
    </span>
  );
};
