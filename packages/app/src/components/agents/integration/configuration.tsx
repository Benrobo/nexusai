import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Cable, CheckCheck, Copy, RefreshCcw, X } from "@/components/icons";
import { FullPageLoader } from "@/components/Loader";
import Modal from "@/components/Modal";
import TooltipComp from "@/components/TooltipComp";
import { Input } from "@/components/ui/input";
import type { ValidIntegrations } from "@/data/integration";
import {
  getIntegrationConfig,
  rotateIntegrationConfigToken,
} from "@/http/requests";
import { cn } from "@/lib/utils";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  selectedIntegration: {
    agent_id: string;
    int_id: string;
    type: ValidIntegrations;
  };
}

interface Config {
  telegram?: {
    id: string;
    auth_token: string;
    bot_id: string;
    created_at: string;
    groups: {
      id: string;
      name: string;
    }[];
  };
}

export default function IntegrationConfig({
  closeModal,
  isOpen,
  selectedIntegration,
}: Props) {
  const [config, setConfig] = React.useState<Config | null>(null);
  const [isCopied, setIsCopied] = React.useState<string | null>(null);
  const getIntConfigMut = useMutation({
    mutationFn: async (data: { int_id: string; agent_id: string }) =>
      await getIntegrationConfig(data.int_id, data.agent_id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setConfig(resp.data);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const rotateIntConfTokenMut = useMutation({
    mutationFn: async (data: { int_id: string; agent_id: string }) =>
      await rotateIntegrationConfigToken(data.int_id, data.agent_id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      const newToken = resp.data["newToken"];

      // @ts-expect-error
      setConfig((prev) => {
        if (prev) {
          return {
            ...prev,
            telegram: {
              ...prev.telegram,
              auth_token: newToken,
            },
          };
        }
        return prev;
      });
      toast.success("Token rotated successfully");

      getIntConfigMut.mutate({
        int_id: selectedIntegration.int_id,
        agent_id: selectedIntegration.agent_id,
      });
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  const validIntConfigNames: ValidIntegrations[] = ["telegram"];

  React.useEffect(() => {
    if (validIntConfigNames.includes(selectedIntegration?.type)) {
      getIntConfigMut.mutate({
        int_id: selectedIntegration.int_id,
        agent_id: selectedIntegration.agent_id,
      });
    }
  }, [selectedIntegration]);

  React.useEffect(() => {
    setTimeout(() => {
      setIsCopied(null);
    }, 3000);
  }, [isCopied]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => closeModal()}
      isBlurBg
      fixed={false}
      className=""
    >
      <FlexColStart className="w-full max-h-[600px] min-w-[500px] h-full bg-white-300 rounded-[22px] p-1">
        <FlexColStart className="w-full h-auto bg-white-100 rounded-[20px] relative pb-4">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
            onClick={() => {
              closeModal();
            }}
          >
            <X size={15} color="#000" />
          </button>

          <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
            <FlexColCenter
              className={cn(
                "w-auto rounded-full p-1 relative",
                selectedIntegration?.type !== "telegram"
                  ? "border-[2px] bg-dark-100 "
                  : "border-[.4px] bg-white-300/30"
              )}
            >
              {selectedIntegration?.type === "telegram" ? (
                <img
                  src="/assets/logo/telegram.svg"
                  alt="telegram"
                  className="object-contain"
                  width={30}
                />
              ) : (
                <Cable size={20} className="stroke-white-100 p-1" />
              )}
            </FlexColCenter>

            <FlexColStart className="w-full gap-1">
              <h1 className="font-ppM font-bold text-lg">
                {selectedIntegration?.type === "telegram"
                  ? "Telegram Integration"
                  : "Integration"}{" "}
                Configuration
              </h1>
              <p className="text-xs font-ppReg font-light text-gray-500">
                Configure your integration settings.
              </p>
            </FlexColStart>
          </FlexRowStart>

          {/* loader */}
          {getIntConfigMut.isPending && <FullPageLoader />}

          {/* telegram config */}

          {config &&
            selectedIntegration?.type === "telegram" &&
            !getIntConfigMut.isPending && (
              <>
                <FlexColStart className="w-full px-5 py-4 pb-[3em] gap-5">
                  {/* token section */}
                  <FlexColStart className="w-full gap-1">
                    <h1 className="font-ppM font-bold text-md">Token</h1>
                    <p className="text-xs font-ppReg font-light text-gray-500">
                      Token is used to authenticate the bot
                    </p>
                  </FlexColStart>

                  {/* token input */}
                  <FlexRowCenterBtw className="w-full gap-1">
                    <Input
                      value={config?.telegram?.auth_token || ""}
                      placeholder={"Token"}
                      className="font-jb font-bold text-sm w-full"
                      readOnly={true}
                    />

                    {/* rotate and copy token button */}
                    <TooltipComp text="Copy token">
                      <button
                        className="w-[38px] h-[35px] rounded-md bg-dark-100 cursor-pointer flex-center disabled:opacity-[.5] disabled:cursor-not-allowed enableBounceEffect"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `/auth ${config?.telegram?.auth_token}`
                          );
                          toast.success("Copied to clipboard");
                          setIsCopied("token");
                        }}
                      >
                        {isCopied === "token" ? (
                          <CheckCheck size={15} className="stroke-white-100" />
                        ) : (
                          <Copy size={15} className="stroke-white-100" />
                        )}
                      </button>
                    </TooltipComp>
                    <TooltipComp text="Rotate token">
                      <button
                        className="w-[38px] h-[35px] rounded-md bg-dark-100 cursor-pointer flex-center disabled:opacity-[.5] disabled:cursor-not-allowed enableBounceEffect"
                        onClick={() => {
                          const confirm = window.confirm(
                            "Are you sure you want to rotate the token? Doing this would invalidate the current token as well as delete all the groups connected to the bot."
                          );

                          if (!confirm) return;

                          rotateIntConfTokenMut.mutate({
                            int_id: selectedIntegration.int_id,
                            agent_id: selectedIntegration.agent_id,
                          });
                        }}
                        disabled={rotateIntConfTokenMut.isPending}
                      >
                        <RefreshCcw
                          size={15}
                          className={cn(
                            "stroke-white-100",
                            rotateIntConfTokenMut.isPending && "animate-spin"
                          )}
                        />
                      </button>
                    </TooltipComp>
                  </FlexRowCenterBtw>

                  {/* show groups belonging to the bot */}
                  <FlexRowCenterBtw className="w-full gap-5 pr-5">
                    <FlexColStart className="w-full gap-1">
                      <h1 className="font-ppM font-bold text-md">Groups</h1>
                      <p className="text-xs font-ppReg font-light text-gray-500">
                        {/* Groups that the bot is in */}
                        {config?.telegram && config?.telegram?.groups.length > 0
                          ? `Groups that the bot is in`
                          : `Groups connected to this bot would appear here`}
                      </p>
                    </FlexColStart>

                    {/* merged groups avatar based on the name */}
                    <TgMergedGroupImgStack
                      groups={config?.telegram?.groups || []}
                    />
                  </FlexRowCenterBtw>

                  {/* Usage */}
                  <FlexColStart className="w-full gap-1">
                    <h1 className="font-ppM font-bold text-md">Usage</h1>
                    <p className="text-xs font-ppReg font-light text-gray-500">
                      Before the bot can be used, it must first be added to a
                      group then authenticated.
                    </p>

                    {/* first */}
                    <FlexColStart className="w-full gap-1">
                      <p className="text-xs font-ppReg font-light text-gray-500">
                        <span className="text-dark-100 font-ppM">First</span>,
                        Search for{" "}
                        <span className="text-blue-100 font-ppM">
                          @usenexusai_bot
                        </span>{" "}
                        or use this{" "}
                        <a
                          href={"https://t.me/usenexusai_bot"}
                          className="text-blue-100 font-ppM underline"
                          target="_blank"
                        >
                          Link
                        </a>{" "}
                        to add the bot to your group.
                      </p>

                      <FlexRowStartCenter className="w-full">
                        <p className="text-xs font-ppReg font-light text-gray-500">
                          <span className="text-dark-100 font-ppM">Then</span>,
                          authenticate the bot by using this command
                        </p>

                        <span className="min-w-[120px] px-3 py-1 rounded-md text-xs bg-white-300 border-[.5px] border-white-400/30  text-red-305 font-jb font-bold">
                          /auth {"<token>"}
                        </span>

                        <button
                          className="rounded-md bg-transparent cursor-pointer flex-center disabled:opacity-[.5] disabled:cursor-not-allowed sclae-[.50] enableBounceEffect"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `/auth ${config?.telegram?.auth_token}`
                            );
                            toast.success("Copied to clipboard");
                            setIsCopied("tg-auth-token-implementation");
                          }}
                        >
                          {isCopied === "tg-auth-token-implementation" ? (
                            <CheckCheck size={15} className="stroke-dark-100" />
                          ) : (
                            <Copy size={15} className="stroke-dark-100" />
                          )}
                        </button>
                      </FlexRowStartCenter>
                    </FlexColStart>
                  </FlexColStart>
                </FlexColStart>
              </>
            )}
        </FlexColStart>
      </FlexColStart>
    </Modal>
  );
}

interface TgMergedGroupImgStackProps {
  groups: {
    id: string;
    name: string;
  }[];
}

function TgMergedGroupImgStack({ groups }: TgMergedGroupImgStackProps) {
  if (groups.length === 0) {
    return (
      <TooltipComp text="Connected group would be shown here">
        <div className="w-[30px] h-[30px] border-[.5px] border-white-400/50 rounded-full bg-white-100 text-dark-100 font-ppReg text-xs flex-center">
          N/A
        </div>
      </TooltipComp>
    );
  }
  return (
    <div className="flex -space-x-4 rtl:space-x-reverse">
      {groups?.slice(0, 4).map((g, idx) => (
        <TooltipComp key={idx} text={`@${g.name}`}>
          <img
            key={idx}
            width={30}
            className="w-[35px] h-[30px] border-2 border-white-100 rounded-full object-cover "
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${g.name}`}
            alt=""
          />
        </TooltipComp>
      ))}

      {groups && groups?.length > 4 && (
        <TooltipComp text={`${groups.map((g) => g.name).join(", ")}`}>
          <div className="w-[30px] h-[30px] border-[.5px] border-white-400/50 rounded-full flex-center bg-white-100 text-dark-100 font-ppReg text-xs">
            +{groups.length - 4}
          </div>
        </TooltipComp>
      )}
    </div>
  );
}
