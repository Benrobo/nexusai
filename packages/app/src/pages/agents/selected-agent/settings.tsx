"use client";
import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
} from "@/components/Flex";
import { Input } from "@/components/ui/input";
import {
  CheckCheck,
  Pen,
  SquareArrowOutUpRight,
  Trash,
} from "@/components/icons";
import { cn, formatNumber, validatePhoneNumber } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  deleteAgent,
  getAgentFwdNumber,
  getAgentSettings,
  getAgentSubscription,
  getCustomerPortal,
  sendOTP,
  updateAgentSettings,
} from "@/http/requests";
import type { AgentType, ResponseData } from "@/types";
import toast from "react-hot-toast";
import { Spinner } from "@/components/Spinner";
import Button from "@/components/ui/button";
import ManagePhoneNumber from "@/components/agents/settings/manage_phone_number";
import VerifyPhoneModal from "@/components/agents/verify-phone";
import { FullPageLoader } from "@/components/Loader";
import dayjs from "dayjs";

interface SettingsProps {
  agent_id: string;
  type: AgentType;
}

interface PhoneSubscriptionData {
  id: string;
  status: "on_trial" | "active" | "paused" | "cancelled" | "expired";
  renews_at: string;
  ends_at: string | null;
  product_id: string;
}

interface AgentSettings {
  allow_handover: boolean;
  handover_condition: string;
  security_code: string;
  activated: boolean;
  purchased_number: {
    phone: string;
  } | null;
}

export default function SettingsPage({ agent_id, type }: SettingsProps) {
  const [phoneSubscription, setPhoneSubscription] =
    useState<PhoneSubscriptionData | null>(null);
  const [forwardingNum, setForwardingNum] = useState<string | null>(null);
  const [handoverEditMode, setHandoverEditMode] = useState(false);
  const [addHandoverNumber, setAddHandoverNumber] = useState(false);
  const [handoverNum, setHandoverNum] = useState("");
  const [deletingAgent, setDeletingAgent] = useState(false);
  const [agentSettings, setAgentSettings] = useState<AgentSettings | null>(
    null
  );
  const getFwdNumberQuery = useMutation({
    mutationFn: async (id: string) => await getAgentFwdNumber(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      if (resp.data?.phone) {
        // setHandoverEditMode(true);
        setForwardingNum(resp.data?.phone);
      }
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const updateAgentSettingsMut = useMutation({
    mutationFn: async (data: any) => updateAgentSettings(data),
    onSuccess: () => {
      toast.success("Settings updated");
      window.location.reload();
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const sendOTPMut = useMutation({
    mutationFn: async (data: { phone: string; agent_id: string }) =>
      sendOTP(data.phone, data.agent_id),
    onSuccess: () => {
      toast.success("OTP sent successfully");
      setAddHandoverNumber(true);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
      setHandoverNum("");
    },
  });
  const getAgentSubscriptionMut = useMutation({
    mutationFn: async (id: string) => getAgentSubscription(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setPhoneSubscription(resp.data);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const getCustomerPortalMut = useMutation({
    mutationFn: async (id: string) => getCustomerPortal(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      window.open(resp.data, "_blank");
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const getAgentSettingsMut = useMutation({
    mutationFn: async (id: string) => getAgentSettings(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setAgentSettings(resp.data);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (agent_id) {
      if (!forwardingNum) getFwdNumberQuery.mutate(agent_id);
      if (!agentSettings) getAgentSettingsMut.mutate(agent_id);
    }
  }, [agent_id]);

  useEffect(() => {
    if (agentSettings) {
      if (
        ["ANTI_THEFT", "SALES_ASSISTANT"].includes(type) &&
        agentSettings?.purchased_number !== null
      )
        getAgentSubscriptionMut.mutate(agent_id);
    }
  }, [agentSettings]);

  const phoneSubDaysLeft = Math.abs(
    dayjs().diff(dayjs(phoneSubscription?.renews_at), "day")
  );

  return (
    <>
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
          </FlexRowStartBtw>

          <br />

          <span className="w-full p-[.2px] h-auto bg-white-400/20"></span>

          {(["ANTI_THEFT", "SALES_ASSISTANT"] as AgentType[]).includes(
            type
          ) && <ManagePhoneNumber agent_id={agent_id} />}

          <FlexColStart className={cn("w-full h-auto mt-10 relative px-1")}>
            {["SALES_ASSISTANT", "ANTI_THEFT"].includes(type) && (
              <>
                <FlexRowStartBtw className="w-full gap-1 rounded-md bg-white-300 px-4 py-2">
                  <FlexColStart className="w-auto gap-1">
                    <FlexRowStart className="w-auto">
                      <p className="text-sm font-ppM text-dark-100">
                        Forwarding number
                      </p>
                    </FlexRowStart>
                    <p className="text-xs font-jb text-white-400">
                      {type === "SALES_ASSISTANT"
                        ? "The number to which the agent would be handed over to. (US only)"
                        : "Your personal phone number for anti-theft"}
                    </p>
                  </FlexColStart>

                  <FlexRowEnd className="w-auto">
                    <Input
                      type="text"
                      className="w-auto text-xs text-dark-100 font-bold font-jb placeholder:text-white-400/50 tracking-wide disabled:cursor-not-allowed disabled:opacity-1"
                      placeholder="+1 234 567 8890"
                      value={
                        handoverEditMode
                          ? handoverNum ?? ""
                          : forwardingNum
                            ? formatNumber(forwardingNum ?? "")
                            : handoverNum
                      }
                      onChange={(e: any) => {
                        if (e.target.value.length > 12) return;
                        setHandoverNum(e.target.value);
                      }}
                      disabled={
                        forwardingNum && !handoverEditMode ? true : false
                      }
                    />

                    {(!forwardingNum || handoverEditMode) && (
                      <button
                        className="w-[38px] h-[38px] bg-dark-100 flex flex-col items-center justify-center rounded-sm active:scale-[.95] target:scale-[.90] transition-all disabled:bg-dark-100/50 disabled:text-white-100"
                        onClick={() => {
                          if (handoverEditMode || !forwardingNum) {
                            if (handoverNum.length < 12) {
                              return toast.error("Invalid phone number");
                            }
                            if (!handoverNum.startsWith("+1")) {
                              return toast.error(
                                "Phone number must start with +1"
                              );
                            }
                            if (!validatePhoneNumber(handoverNum)) {
                              return toast.error("Invalid phone number");
                            }
                            sendOTPMut.mutate({
                              phone: handoverNum,
                              agent_id,
                            });
                            return;
                          }
                          setHandoverEditMode((prev) => !prev);
                        }}
                        disabled={sendOTPMut.isPending}
                      >
                        {sendOTPMut.isPending ? (
                          <Spinner size={15} />
                        ) : (
                          <CheckCheck className="stroke-white-100" size={15} />
                        )}
                      </button>
                    )}

                    {forwardingNum && (
                      <button
                        className="w-[38px] h-[38px] bg-dark-100 flex flex-col items-center justify-center rounded-sm active:scale-[.95] target:scale-[.90] transition-all disabled:bg-dark-100/50 disabled:text-white-100"
                        onClick={() => {
                          setHandoverEditMode((prev) => !prev);
                        }}
                      >
                        <Pen className="stroke-white-100" size={15} />
                      </button>
                    )}
                  </FlexRowEnd>
                </FlexRowStartBtw>

                {/* verify phone modal */}
                {addHandoverNumber && (
                  <VerifyPhoneModal
                    closeModal={() => setAddHandoverNumber(false)}
                    isOpen={addHandoverNumber}
                    refetchVerifiedPhone={() => {
                      getFwdNumberQuery.mutate(agent_id);
                      setHandoverNum("");
                    }}
                    agent_id={agent_id}
                  />
                )}
              </>
            )}

            {["ANTI_THEFT", "SALES_ASSISTANT"].includes(type) && (
              <FlexColStart className="w-full h-[115px] max-h-[120px] rounded-md border-[.5px] border-white-400/30 px-4 py-4 relative overflow-hidden mt-10">
                <FlexRowStartBtw className="w-full gap-2">
                  {getAgentSubscriptionMut.isPending ? (
                    <FullPageLoader showText={false} fixed={false} />
                  ) : !getAgentSubscriptionMut.isPending &&
                    phoneSubscription ? (
                    <>
                      <FlexColStart className="w-full gap-1">
                        <FlexRowStart className="w-auto">
                          <p className="text-md font-ppB text-dark-100">
                            Active Subscription
                          </p>

                          <span
                            className={cn(
                              "text-xs font-ppReg rounded-full text-white-100 px-2 py-[1px] flex-center gap-1",
                              phoneSubscription?.status === "active"
                                ? "bg-blue-101"
                                : "bg-red-305"
                            )}
                          >
                            <div className="w-[4px] h-[4px] bg-white-100 rounded-full" />
                            {phoneSubscription?.status}
                          </span>
                        </FlexRowStart>
                        <span className="text-xs font-ppReg text-dark-100/50">
                          subcription is due{" "}
                          <span className="text-dark-100 font-ppM">
                            {dayjs(phoneSubscription?.renews_at).format(
                              "DD, MMM YYYY [at] hh:mm A"
                            )}
                          </span>
                        </span>
                      </FlexColStart>

                      <FlexColEnd className="w-full h-full gap-4">
                        <p className="text-sm font-jb font-semibold text-dark-100">
                          {/* 21 days remaining */}
                          {phoneSubDaysLeft}{" "}
                          {Number(phoneSubDaysLeft) === 1 ? "day" : "days"}{" "}
                          remaining.
                        </p>
                        <Button
                          intent={"dark"}
                          className="w-auto max-w-[200px] h-[36px] rounded-lg px-4 text-xs font-ppReg drop-shadow disabled:bg-dark-100/50 disabled:text-white-100 disabled"
                          disabled={getCustomerPortalMut.isPending}
                          onClick={() => {
                            getCustomerPortalMut.mutate(phoneSubscription?.id!);
                          }}
                          isLoading={updateAgentSettingsMut.isPending}
                          rightIcon={<SquareArrowOutUpRight size={15} />}
                        >
                          {getCustomerPortalMut.isPending && (
                            <Spinner color="#fff" size={15} />
                          )}{" "}
                          View Billing Portal
                        </Button>
                      </FlexColEnd>
                    </>
                  ) : null}
                </FlexRowStartBtw>

                {!getAgentSubscriptionMut.isPending && !phoneSubscription && (
                  <FlexColCenter className="w-full h-full backdrop-blur-md absolute top-0 left-0 bg-white-300 z-[10] gap-1">
                    <p className="text-dark-100 text-sm font-ppB">
                      Phone Number Subscription
                    </p>
                    <p className="text-dark-100 text-xs font-ppM">
                      You have not subscribed to a phone number yet.
                    </p>
                  </FlexColCenter>
                )}
              </FlexColStart>
            )}

            <FlexColCenter className="w-full h-auto mt-10">
              <FlexRowStartBtw className="w-full h-full px-5 py-3 border-[1px] border-red-305 bg-red-305/10 rounded-md">
                <FlexColStart className="w-full">
                  <h1 className="font-ppB text-sm text-red-305">Danger Zone</h1>
                  <p className="text-sm font-ppReg text-red-305">
                    Please note that this action is irreversible.
                  </p>
                </FlexColStart>
                <Button
                  className="w-auto min-w-[200px] px-10 rounded-xl bg-red-305/80 text-xs text-white-100  hover:bg-red-305 enableBounceEffect font-ppM disabled:bg-red-305/50 disabled:text-white-100"
                  onClick={() => {
                    const confirm = window.confirm(
                      "Are you sure you want to delete this agent?"
                    );
                    if (!confirm) return;

                    setDeletingAgent(true);
                    toast.promise(deleteAgent(agent_id), {
                      loading: "Deleting agent...",
                      success: () => {
                        setDeletingAgent(false);
                        setTimeout(() => {
                          window.location.href = "/agents";
                        }, 1000);
                        return "Agent deleted successfully";
                      },
                      error: () => {
                        setDeletingAgent(false);
                        return "Failed to delete agent";
                      },
                    });
                  }}
                  isLoading={deletingAgent}
                  disabled={deletingAgent}
                >
                  <Trash size={15} className="stroke-white-100" />
                  <span>Delete Agent</span>
                </Button>
              </FlexRowStartBtw>
            </FlexColCenter>
          </FlexColStart>
        </FlexColStart>
      </div>
    </>
  );
}
