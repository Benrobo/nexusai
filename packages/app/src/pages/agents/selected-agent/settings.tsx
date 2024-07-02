"use client";
import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenter,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
} from "@/components/Flex";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCheck, ShieldCheck } from "@/components/icons";
import { cn, formatNumber, validatePhoneNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAgentSettings,
  sendOTP,
  updateAgentSettings,
} from "@/http/requests";
import type { AgentType, ResponseData } from "@/types";
import toast from "react-hot-toast";
import { Spinner } from "@/components/Spinner";
import Button from "@/components/ui/button";
import ManagePhoneNumber from "@/components/agents/settings/manage_phone_number";
import VerifyPhoneModal from "@/components/agents/verify-phone";

const handoverConditions = [
  {
    title: "Emergency",
    value: "emergency",
  },
  {
    title: "Help",
    value: "help",
  },
];

interface AgentSettings {
  allow_handover: boolean;
  handover_condition: "emergency" | "help";
  security_code: string;
}

interface SettingsProps {
  agent_id: string;
  type: AgentType;
}

export default function SettingsPage({ agent_id, type }: SettingsProps) {
  const [error, setError] = useState<null | string>(null);
  const [tabLoading, setTabLoading] = useState(true);
  const [agentSettings, setAgentSettings] = useState<AgentSettings | null>(
    null
  );
  const [settingsDetails, setSettingsDetails] = useState<AgentSettings>(
    {} as AgentSettings
  );
  const [addHandoverNumber, setAddHandoverNumber] = useState(false);
  const [handoverNum, setHandoverNum] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const getAgentSettingsQuery = useMutation({
    mutationFn: async (data: string) => getAgentSettings(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setAgentSettings(resp.data);
      setSettingsDetails(resp.data);
      setTabLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      setError(err.message);
      setTabLoading(false);
      toast.error(err.message);
    },
  });
  const updateAgentSettingsMut = useMutation({
    mutationFn: async (data: any) => updateAgentSettings(data),
    onSuccess: (data) => {
      toast.success("Settings updated");
      window.location.reload();
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const sendOTPMut = useMutation({
    mutationFn: async (data: any) => sendOTP(data),
    onSuccess: () => {
      toast.success("OTP sent successfully");
      setAddHandoverNumber(true);
      setOtpSent(true);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (agent_id && !agentSettings) getAgentSettingsQuery.mutate(agent_id!);
  }, [agent_id]);

  const handleFormChange = (
    key: keyof AgentSettings,
    value: string | boolean
  ) => {
    setSettingsDetails((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const enableSaveChangesButton = () => {
    if (agentSettings?.allow_handover !== settingsDetails?.allow_handover)
      return false;
    if (
      agentSettings?.handover_condition !== settingsDetails?.handover_condition
    )
      return false;
    if (agentSettings?.security_code !== settingsDetails?.security_code)
      return false;
    return true;
  };

  const saveChanges = async () => {
    for (const key of Object.keys(settingsDetails!)) {
      const noValue = !!settingsDetails[key as keyof AgentSettings];
      if (!noValue) {
        // @ts-expect-error
        delete settingsDetails[key];
      }
    }
    updateAgentSettingsMut.mutate({
      ...settingsDetails,
      agent_id,
    });
  };

  if (tabLoading) {
    return (
      <FlexRowCenter className="w-full h-full">
        <Spinner color="#000" />
      </FlexRowCenter>
    );
  }

  return (
    <div className="w-full max-w-[100%] h-full px-10 py-10 overflow-y-scroll pb-[50em] hideScrollBar2">
      <FlexColStart className="w-full h-full ">
        <FlexRowStartBtw className="w-full px-3">
          <FlexColStart className="gap-0 w-full">
            <h1 className="text-2xl font-jb font-extrabold text-dark-100">
              Settings
            </h1>
            <p className="text-sm font-jb text-white-400 mt-1">
              Manage configurations and settings for the agent.
            </p>
          </FlexColStart>

          <Button
            intent={"primary"}
            className="w-[150px] h-[36px] px-4 text-xs font-ppReg drop-shadow disabled:bg-blue-100/70 disabled:text-white-100"
            disabled={enableSaveChangesButton()}
            onClick={saveChanges}
            enableBounceEffect={true}
            isLoading={updateAgentSettingsMut.isPending || tabLoading}
          >
            Save Changes
          </Button>
        </FlexRowStartBtw>

        <br />

        <span className="w-full p-[.2px] h-auto bg-white-400/20"></span>

        {(["ANTI_THEFT", "SALES_ASSISTANT"] as AgentType[]).includes(type) && (
          <ManagePhoneNumber agent_id={agent_id} />
        )}

        {/* settings sections  */}
        <FlexColStart
          className={cn("w-full min-h-[250px] mt-10 relative px-3")}
        >
          {/* handover settings */}
          {type === "ANTI_THEFT" && (
            <>
              <FlexColStart className="w-auto gap-0">
                <h1 className="text-lg font-bold font-jb text-dark-100">
                  Handover
                </h1>
                <p className="text-xs font-ppReg text-white-400/80 mt-1">
                  Configure handover settings for the agent.
                </p>
              </FlexColStart>

              <FlexColStart className="w-full gap-1 rounded-md bg-white-300">
                <FlexRowCenterBtw className="w-full gap-2 px-4 py-3 rounded-md">
                  <p className="text-xs font-ppReg text-dark-100">
                    Enable handover
                  </p>
                  <Switch
                    onCheckedChange={(val: boolean) => {
                      handleFormChange("allow_handover", val);
                    }}
                    className="data-[state=unchecked]:bg-white-400/30"
                    checked={
                      settingsDetails?.allow_handover ??
                      agentSettings?.allow_handover
                    }
                  />
                </FlexRowCenterBtw>
                <span className="w-full p-[.3px] bg-white-400/30"></span>
                <FlexRowCenterBtw className="w-full gap-2 px-4 py-2 mt-0">
                  <p className="text-xs font-ppReg text-dark-100">
                    Handover Condition
                  </p>
                  <Select
                    onValueChange={(val) => {
                      handleFormChange("handover_condition", val);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue
                        placeholder={
                          agentSettings?.handover_condition ?? "Select"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {handoverConditions.map((c, i) => (
                        <SelectItem
                          key={i}
                          value={c.value}
                          className="font-ppReg"
                        >
                          {c.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FlexRowCenterBtw>
              </FlexColStart>

              <FlexRowCenterBtw className="w-full gap-2 px-4 py-3 mt-2 rounded-md bg-white-300">
                <FlexRowStart>
                  <ShieldCheck className="p-[5px] rounded-full bg-dark-100/70" />
                  <FlexColStart className="w-auto gap-0">
                    <p className="text-xs font-ppReg text-dark-100">
                      Security code
                    </p>
                    <span className="text-[10px] font-ppL text-dark-100/50">
                      Security code would be required for emergency scenario.
                    </span>
                  </FlexColStart>
                </FlexRowStart>
                <Input
                  className="w-[150px] text-md font-jb placeholder:text-white-400/50 tracking-wide "
                  type="number"
                  placeholder="456234"
                  value={settingsDetails?.security_code ?? ""}
                  onChange={(e: any) => {
                    const val = (e.target as any).value;
                    if (val.length > 6) return;
                    handleFormChange("security_code", (e.target as any).value);
                  }}
                />
              </FlexRowCenterBtw>
            </>
          )}

          {/* Escallation number */}
          {["ANTI_THEFT", "SALES_ASSISTANT"].includes(type) && (
            <>
              <FlexColStart className="w-auto gap-0">
                {/* <h1 className="text-lg font-bold font-jb text-dark-100">
                  Handover Number
                </h1>
                <p className="text-xs font-ppReg text-white-400/80 mt-1">
                  Configure handover number for the agent.
                </p> */}
              </FlexColStart>

              <FlexRowStartBtw className="w-full gap-1 rounded-md bg-white-300 px-4 py-2">
                <FlexColStart className="w-auto gap-1">
                  <FlexRowStart className="w-auto">
                    <p className="text-xs font-ppReg text-dark-100">
                      Handover number
                    </p>
                  </FlexRowStart>
                  <p className="text-[10px] font-jb text-white-400">
                    The number to which the agent would be handed over to. (US
                    only)
                  </p>
                </FlexColStart>

                <FlexRowEnd className="w-auto">
                  <Input
                    type="text"
                    className="w-auto text-xs font-jb placeholder:text-white-400/50 tracking-wide"
                    placeholder="+1 234 567 8890"
                    value={handoverNum}
                    onChange={(e: any) => {
                      if (e.target.value.length > 12) return;
                      setHandoverNum(e.target.value);
                    }}
                  />

                  <button
                    className="w-[38px] h-[38px] bg-dark-100 flex flex-col items-center justify-center rounded-sm active:scale-[.95] target:scale-[.90] transition-all disabled:bg-dark-100/50 disabled:text-white-100"
                    onClick={() => {
                      if (handoverNum.length < 12) {
                        return toast.error("Invalid phone number");
                      }
                      if (!handoverNum.startsWith("+1")) {
                        return toast.error("Phone number must start with +1");
                      }
                      if (!validatePhoneNumber(handoverNum)) {
                        return toast.error("Invalid phone number");
                      }
                      sendOTPMut.mutate({
                        phone: handoverNum,
                      });
                    }}
                    disabled={sendOTPMut.isPending}
                  >
                    {sendOTPMut.isPending ? (
                      <Spinner />
                    ) : (
                      <CheckCheck className="stroke-white-100" size={15} />
                    )}
                  </button>
                </FlexRowEnd>
              </FlexRowStartBtw>

              {otpSent && (
                <FlexRowEnd className="w-full">
                  <Timer
                    time={20}
                    onClick={() => {
                      sendOTPMut.mutate({
                        phone: handoverNum,
                      });
                    }}
                  />
                </FlexRowEnd>
              )}

              {/* verify phone modal */}
              {addHandoverNumber && (
                <VerifyPhoneModal
                  closeModal={() => setAddHandoverNumber(false)}
                  isOpen={addHandoverNumber}
                  refetchVerifiedPhone={() => {
                    getAgentSettingsQuery.mutate(agent_id);
                  }}
                  agent_id={agent_id}
                />
              )}
            </>
          )}
        </FlexColStart>
      </FlexColStart>
    </div>
  );
}

function NotSupportedOverlay({ type }: { type: string }) {
  return (
    <button disabled className="w-full h-full">
      <FlexColCenter className="w-full h-full backdrop-blur-md absolute top-0 left-0 bg-white-300 z-[10]">
        <p className="text-dark-100 font-jb">Not Supported</p>
        <p className="text-white-400 text-xs font-ppReg">
          Only for {type ?? "Anti-Theft"} agent
        </p>
      </FlexColCenter>
    </button>
  );
}

function Timer({ time, onClick }: { time: number; onClick: () => void }) {
  const [timer, setTimer] = useState(time);
  useEffect(() => {
    const interval = setInterval(() => {
      if (timer <= 0) return clearInterval(interval);
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);
  return (
    <>
      {timer > 1 && (
        <p className="text-xs font-ppReg text-white-400">{timer}s</p>
      )}

      {/* resend */}
      {timer <= 0 && (
        <button
          className="text-[10px] font-jb underline"
          onClick={() => {
            setTimer(20);
            onClick && onClick();
          }}
          disabled={timer > 0}
        >
          Resend OTP
        </button>
      )}
    </>
  );
}
