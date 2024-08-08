import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { CheckCheck, Copy, SendHorizontal } from "@/components/icons";
import { Spinner } from "@/components/Spinner";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getChatbotConfig, updateChatbotConfig } from "@/http/requests";
import { cn } from "@/lib/utils";
import type { AgentType, ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SketchPicker } from "react-color";

dayjs.extend(relativeTime);

interface AppearanceProps {
  agent_id: string;
  type: AgentType;
}

interface BotConfigData {
  id: string | null;
  agentId: string | null;
  brand_name: string | null;
  brand_color: string | null;
  text_color: string | null;
  welcome_message: string | null;
  suggested_questions: string | null;
  logo?: string | null;
}

export interface NewBotConfigData {
  brand_name: string | null | undefined;
  brand_color: string | null | undefined;
  text_color: string | null | undefined;
  welcome_message: string | null | undefined;
  suggested_questions: string | null | undefined;
  logo?: string | null | undefined;
}

export default function Appearance({ agent_id, type }: AppearanceProps) {
  const [pageLoading, setPageLoading] = useState(true);
  const [botConfig, setBotConfig] = useState<BotConfigData | null>(null);
  const [newBotConfig, setNewBotConfig] = useState<NewBotConfigData>(
    {} as NewBotConfigData
  );
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [activeBrandIdentity, setActiveBrandIdentity] = useState<
    "brand_color" | "text_color" | null
  >(null);
  const getBotConfigMut = useMutation({
    mutationFn: async (id: string) => await getChatbotConfig(id),
    onSuccess(data) {
      const resp = data as ResponseData;
      const config = resp.data;
      setBotConfig(config);
      setNewBotConfig(config);
      setPageLoading(false);
    },
    onError(error) {
      const err = (error as any).response.data as ResponseData;
      toast.error(err?.message ?? "An error occured.");
      setPageLoading(false);
    },
  });
  const updateBotConfigMut = useMutation({
    mutationFn: async (data: NewBotConfigData & { agent_id: string }) =>
      await updateChatbotConfig(data),
    onSuccess(data) {
      const resp = data as ResponseData;
      toast.success(resp.message);
      getBotConfigMut.mutate(agent_id);
    },
    onError(error) {
      const err = (error as any).response.data as ResponseData;
      toast.error(err?.message ?? "An error occured.");
    },
  });

  useEffect(() => {
    if (agent_id) getBotConfigMut.mutate(agent_id);
  }, [agent_id]);

  const handleBotConfigChange = (
    key: keyof NewBotConfigData,
    value: string | null
  ) => {
    if (!value) value = null;
    setNewBotConfig((prev: NewBotConfigData) => ({
      ...prev,
      [key as keyof NewBotConfigData]: value,
    }));
  };

  const disableSaveBtn = () => {
    if (
      newBotConfig?.brand_name === botConfig?.brand_name &&
      newBotConfig?.brand_color === botConfig?.brand_color &&
      newBotConfig?.text_color === botConfig?.text_color &&
      newBotConfig?.welcome_message === botConfig?.welcome_message &&
      newBotConfig?.suggested_questions === botConfig?.suggested_questions
    ) {
      return true;
    }
    return false;
  };

  const handleSave = () => {
    if (!newBotConfig?.brand_name || newBotConfig?.brand_name.length === 0) {
      toast.error("Brand name is required.");
      return;
    }
    if (
      !newBotConfig.welcome_message ||
      newBotConfig.welcome_message.length === 0
    ) {
      toast.error("Welcome message is required.");
      return;
    }

    const newBotConfigKeys = Object.keys(newBotConfig);

    newBotConfigKeys.forEach((key) => {
      if (!newBotConfig[key as keyof NewBotConfigData]) {
        // @ts-expect-error
        delete newBotConfig[key];
      }
    });

    const payload = {
      agent_id,
      ...newBotConfig,
    };

    updateBotConfigMut.mutate(payload);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsCopied(null);
    }, 1000);
  }, [isCopied]);

  if (type !== "CHATBOT") return null;

  if (getBotConfigMut.isPending || pageLoading) {
    return (
      <FlexColCenter className="w-full h-full">
        <Spinner size={25} color="#000" />
      </FlexColCenter>
    );
  }

  const codeNippet = `<script src="https://cdn.jsdelivr.net/npm/nexusai-embed@1.0.6/nexus.js" id="${agent_id}"></script>`;

  return (
    <FlexRowStart className="w-full h-screen gap-0">
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
          <Input
            className="font-ppReg"
            placeholder="Cassie"
            value={newBotConfig?.brand_name ?? botConfig?.brand_name ?? ""}
            onChange={(e) =>
              handleBotConfigChange("brand_name", e.target.value)
            }
          />
        </FlexColStart>
        <FlexColStart className="w-full gap-1 mt-2">
          <p className="text-sm font-ppM text-dark-100">Welcome message</p>
          <Input
            className="font-ppReg"
            placeholder="How can i help you?"
            value={
              newBotConfig?.welcome_message ?? botConfig?.welcome_message ?? ""
            }
            onChange={(e) =>
              handleBotConfigChange("welcome_message", e.target.value)
            }
          />
        </FlexColStart>

        {/* brand identity */}
        <FlexColStart className="w-full gap-1 mt-7">
          <p className="text-sm font-ppM text-dark-100">Brand Identity</p>
          <FlexColStart className="w-full gap-4 relative">
            <FlexRowStartBtw className="w-full relative">
              <p className="text-xs font-ppM text-white-400">Brand color</p>
              <button
                className={cn(
                  "w-[20px] h-[20px] relative rounded-full bg-dark-100 enableBounceEffect"
                )}
                style={{
                  background:
                    newBotConfig?.brand_color ?? botConfig?.brand_color ?? "",
                }}
                onClick={() => {
                  if (activeBrandIdentity === "brand_color") {
                    setActiveBrandIdentity(null);
                  } else {
                    setActiveBrandIdentity("brand_color");
                  }
                }}
              ></button>
              {activeBrandIdentity === "brand_color" && (
                <SketchPicker
                  className={cn("absolute z-[100]")}
                  color={
                    newBotConfig?.brand_color ?? botConfig?.brand_color ?? ""
                  }
                  onChange={(color) =>
                    handleBotConfigChange("brand_color", color.hex)
                  }
                />
              )}
            </FlexRowStartBtw>
            <FlexRowStartBtw className="w-full">
              <p className="text-xs font-ppM text-white-400">Text color</p>
              <button
                className={cn(
                  "w-[20px] h-[20px] rounded-full bg-dark-100 enableBounceEffect"
                )}
                style={{
                  background:
                    newBotConfig?.text_color ?? botConfig?.text_color ?? "",
                }}
                onClick={() => {
                  if (activeBrandIdentity === "text_color") {
                    setActiveBrandIdentity(null);
                  } else {
                    setActiveBrandIdentity("text_color");
                  }
                }}
              ></button>
              {activeBrandIdentity === "text_color" && (
                <SketchPicker
                  className={cn("absolute z-[100]")}
                  color={
                    newBotConfig?.text_color ?? botConfig?.text_color ?? ""
                  }
                  onChange={(color) =>
                    handleBotConfigChange("text_color", color.hex)
                  }
                />
              )}
            </FlexRowStartBtw>
          </FlexColStart>
        </FlexColStart>

        {/* suggested questions */}
        {/* disable for now */}
        {false && (
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
              value={
                newBotConfig?.suggested_questions ??
                botConfig?.suggested_questions ??
                ""
              }
              onChange={(e) => {
                const value = e.target.value;
                const questions = value.split(",").filter((q) => q.length > 0);
                if (questions.length > 5) return;
                handleBotConfigChange("suggested_questions", value);
              }}
            />
          </FlexColStart>
        )}

        {/* embed section */}
        <FlexColStart className="w-full gap-1 mt-7">
          <FlexRowStartCenter className="w-full">
            <p className="text-sm font-ppM text-dark-100">Embed Code</p>
            <button
              className="rounded-md bg-transparent cursor-pointer flex-center disabled:opacity-[.5] disabled:cursor-not-allowed sclae-[.50] enableBounceEffect"
              onClick={() => {
                navigator.clipboard.writeText(codeNippet);
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
          <p className="font-ppReg text-xs flex-cencter gap-3 text-white-400">
            Copy and paste the code below before the closing{" "}
            <span className="font-jb font-medium px-[2px] py-[2px] mt-1 leading-3 bg-dark-300 rounded-md text-white-100 text-xs">
              {"</body>"}
            </span>{" "}
            tag in your website.
          </p>
          <span className="font-jb font-medium px-1 py-1 bg-white-300 rounded-md text-orange-100 text-xs border-white-400/30 border-[.5px] mt-3">
            {`<script src="...." id="${agent_id}"></script>`}
          </span>
        </FlexColStart>

        {/* controls */}
        <Button
          className="w-full max-w-[80px] h-[35px] font-ppReg text-xs bg-brown-100 text-white-100 rounded-md mt-5 disabled:bg-brown-100/50 disabled:text-white-100"
          intent={"dark"}
          disabled={disableSaveBtn()}
          enableBounceEffect
          isLoading={updateBotConfigMut.isPending}
          onClick={handleSave}
        >
          Save
        </Button>
      </FlexColStart>
      <FlexColCenter className="w-full h-full bg-white-100">
        <FlexColStart className="w-full max-w-[400px] h-full max-h-[600px] bg-white-100 rounded-md overflow-hidden shadow-lg gap-0">
          {/* header */}
          <FlexRowStartCenter
            className="w-full px-3 py-5 bg-dark-100"
            style={{
              background:
                newBotConfig?.brand_color ?? botConfig?.brand_color ?? "",
            }}
          >
            <div className="w-[30px] h-[30px] bg-blue-101 rounded-full"></div>
            <p
              className="text-md font-ppM text-white-100"
              style={{
                color: newBotConfig?.text_color ?? botConfig?.text_color ?? "",
              }}
            >
              {newBotConfig?.brand_name && newBotConfig?.brand_name.length > 0
                ? newBotConfig?.brand_name
                : botConfig?.brand_name ?? ""}
            </p>
          </FlexRowStartCenter>

          {/* chat messages lists */}
          <FlexColStart className="w-full h-full p-3 overflow-y-auto overflow-x-hidden relative">
            {/* ai msg */}
            <FlexRowStart className="w-full gap-1">
              <img
                src="/assets/logo/nexus-dark.svg"
                width={20}
                className="rounded-full"
              />
              <FlexColStart
                className={cn(
                  "w-auto max-w-[300px] bg-dark-100 p-2 rounded-tr-md rounded-br-md rounded-bl-md relative"
                )}
                style={{
                  background:
                    newBotConfig?.brand_color ?? botConfig?.brand_color ?? "",
                  color:
                    newBotConfig?.text_color ?? botConfig?.text_color ?? "",
                }}
              >
                <span className="text-[10px] text-white-300">
                  {dayjs(new Date()).format("hh:mm A")}
                </span>
                <p
                  className="text-white-100 font-ppReg text-xs"
                  style={{
                    color:
                      newBotConfig?.text_color ?? botConfig?.text_color ?? "",
                  }}
                >
                  {newBotConfig?.welcome_message ?? botConfig?.welcome_message}
                </p>
              </FlexColStart>
            </FlexRowStart>

            {/* user msg */}
            <FlexRowEnd className="w-full gap-1">
              <FlexColStart
                className={cn(
                  "w-auto max-w-[300px] bg-white-400/20 p-2 rounded-tl-md rounded-bl-md rounded-br-md relative "
                )}
              >
                <span className="text-[10px] text-white-400">
                  {dayjs(new Date()).format("hh:mm A")}
                </span>
                <p className="text-dark-100 font-ppReg text-xs">
                  Hi, what services do you offer?
                </p>
              </FlexColStart>
            </FlexRowEnd>

            {/* suggested questions */}
            <FlexRowEnd className="w-auto gap-0 absolute right-2 bottom-0 flex-wrap">
              {newBotConfig?.suggested_questions
                ? newBotConfig?.suggested_questions
                    .split(",")
                    .filter((q) => q.length > 0)
                    .map((question, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 bg-dark-100 rounded-md text-white-100 text-xs font-ppReg mr-1"
                        style={{
                          background:
                            newBotConfig?.brand_color ??
                            botConfig?.brand_color ??
                            "",
                          color:
                            newBotConfig?.text_color ??
                            botConfig?.text_color ??
                            "",
                        }}
                      >
                        {question}
                      </button>
                    ))
                : botConfig?.suggested_questions
                  ? botConfig?.suggested_questions
                      .split(",")
                      .filter((q) => q.length > 0)
                      .map((question, index) => (
                        <button
                          key={index}
                          className="px-3 py-2 bg-dark-100 rounded-md text-white-100 text-xs font-ppReg mr-1"
                          style={{
                            background:
                              newBotConfig?.brand_color ??
                              botConfig?.brand_color ??
                              "",
                            color:
                              newBotConfig?.text_color ??
                              botConfig?.text_color ??
                              "",
                          }}
                        >
                          {question}
                        </button>
                      ))
                  : null}
            </FlexRowEnd>
          </FlexColStart>

          {/* chat input */}
          <FlexColCenter className="w-full px-4 py-2">
            <FlexRowStartCenter className="w-full">
              <Input className="w-full" placeholder="Type a message..." />
              <button className="w-[50px] h-[35px] px-2 py-2 bg-dark-100 rounded-md flex items-center justify-center enableBounceEffect">
                <SendHorizontal size={15} className="stroke-white-100" />
              </button>
            </FlexRowStartCenter>
            <FlexRowCenter className="w-full py-3">
              <p className="text-white-400 text-xs font-ppReg">Powered by</p>
              <img width={70} src="/assets/logo/nexus-logo-2.svg" />
            </FlexRowCenter>
          </FlexColCenter>
        </FlexColStart>
      </FlexColCenter>
    </FlexRowStart>
  );
}
