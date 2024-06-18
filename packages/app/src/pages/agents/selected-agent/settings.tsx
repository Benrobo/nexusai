"use client";
import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenter,
  FlexRowCenterBtw,
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
import { ShieldCheck } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAgentSettings, updateAgentSettings } from "@/http/requests";
import type { AgentType, ResponseData } from "@/types";
import toast from "react-hot-toast";
import { Spinner } from "@/components/Spinner";
import Button from "@/components/ui/button";
import ManagePhoneNumber from "@/components/agents/settings/manage_phone_number";

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
    <div className="w-full max-w-[100%] h-full px-10 py-10">
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

        {(["ANTI_THEFT", "AUTOMATED_CUSTOMER_SUPPORT"] as AgentType[]).includes(
          type
        ) && <ManagePhoneNumber agent_id={agent_id} />}

        {/* settings sections (ANTI-THEFT)  */}
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
