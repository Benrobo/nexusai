import usePathname from "@/hooks/usePathname";
import React from "react";
import { MessagesSquare, User } from "./icons";
import { FlexColCenter, FlexColStart } from "./Flex";
import { useDataCtx } from "@/context/DataCtx";
import useAuth from "@/hooks/useAuth";
import { FullPageLoader } from "./Loader";

type PageType = "account" | "conversations" | "home";

const pageConfig: Record<
  PageType,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
  }
> = {
  account: {
    title: "Account Details",
    description: "Create an account to get started",
    icon: <User size={60} className="stroke-dark-100" />,
  },
  conversations: {
    title: "Conversations",
    description: "No conversations found.",
    icon: <MessagesSquare size={60} className="stroke-dark-100" />,
  },
  home: {
    title: "NexusAI",
    description:
      "AI-powered Chatbot created by Nexus to help deal with customer support.",
    icon: (
      <img
        width={80}
        src="/assets/images/logos/nexus-dark.svg"
        className="rounded-full"
      />
    ),
  },
};

export default function ProtectPage<P>(Component: React.ComponentType<P>) {
  return function ComponentModified(props: P & any) {
    const { loading, status, user } = useAuth();
    const { setAuthVisible, agent_id, chatbotConf } = useDataCtx();
    const { pathname } = usePathname();
    const page = pathname.toLowerCase() as PageType;

    if (loading) {
      return <FullPageLoader showText={false} />;
    }

    if (!agent_id) {
      console.error("Invalid Chatbot Configuration");
      return (
        <FlexColCenter className="w-full h-screen gap-1">
          <h1 className="text-lg font-ppM text-dark-100">
            Invalid Chatbot Widget Configuration
          </h1>
          <p className="text-sm font-ppReg text-white-400">
            Something went wrong with the chatbot widget configuration.
          </p>
          {!user?.chatbotConfig && (
            <p className="text-sm font-ppReg text-dark-100">
              INVALID_AGENT_ID: {agent_id}
            </p>
          )}
        </FlexColCenter>
      );
    }

    if (status === "unauthorised" && !loading) {
      const { icon, title } = pageConfig[page] || pageConfig.home;

      return (
        <FlexColStart className="w-full h-full">
          <FlexColCenter className="w-full h-auto min-h-[70%]">
            {icon}
            <FlexColCenter className="gap-4 text-center px-6 mt-2">
              <h1 className="font-ppB text-lg text-dark-100">{title}</h1>
              <h1 className="font-ppReg text-sm text-white-400">
                Create an account to get started
              </h1>
              <button
                className="w-[200px] px-5 py-3 rounded-full flex-center gap-3 font-ppReg text-xs text-white-100 bg-dark-100 enableBounceEffect"
                onClick={() => {
                  if (status === "unauthorised") {
                    setAuthVisible(true);
                  }
                }}
                style={{
                  backgroundColor: chatbotConf?.brand_color ?? "#000",
                  color: chatbotConf?.text_color ?? "#fff",
                }}
              >
                <User
                  size={20}
                  className="stroke-white-100"
                  color={chatbotConf?.text_color ?? "#fff"}
                />
                <span>Create Account</span>
              </button>
            </FlexColCenter>
          </FlexColCenter>
        </FlexColStart>
      );
    }

    return <Component {...props} />;
  };
}
