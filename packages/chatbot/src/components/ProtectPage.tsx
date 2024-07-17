import usePathname from "@/hooks/usePathname";
import React from "react";
import { MessagesSquare, SendHorizontal, User } from "./icons";
import { FlexColCenter, FlexColStart } from "./Flex";

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
    description: "No conversations found. Create an account to get started.",
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
    const isAuthenticated = true;
    const { pathname } = usePathname();
    const page = pathname.toLowerCase() as PageType;

    if (!isAuthenticated || (isAuthenticated && page === "home")) {
      const { title, description, icon } = pageConfig[page] || pageConfig.home;

      return (
        <FlexColStart className="w-full h-full">
          <FlexColCenter className="w-full h-auto min-h-[70%]">
            {icon}
            <FlexColCenter className="gap-4 text-center px-6 mt-2">
              <h1 className="font-ppB text-lg text-dark-100">{title}</h1>
              <h1 className="font-ppReg text-sm text-white-400">
                {description}
              </h1>
              <button className="w-[200px] px-5 py-3 rounded-full flex-center gap-3 font-ppReg text-xs text-white-100 bg-dark-100 enableBounceEffect">
                {!isAuthenticated ? (
                  <>
                    <User size={20} className="stroke-white-100" />
                    <span>Create Account</span>
                  </>
                ) : (
                  <>
                    <span>Start a conversation</span>
                    <SendHorizontal size={20} className="stroke-white-100" />
                  </>
                )}
              </button>
            </FlexColCenter>
          </FlexColCenter>
        </FlexColStart>
      );
    }

    return <Component {...props} />;
  };
}
