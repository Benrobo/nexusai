import usePathname from "@/hooks/usePathname";
import React from "react";
import { MessagesSquare, SendHorizontal, User } from "./icons";
import { FlexColCenter, FlexColStart } from "./Flex";

export default function ProtectPage<P>(Component: React.ComponentType<P>) {
  const ComponentModified = (props: P & any) => {
    const isAuthenticated = true;
    const { pathname } = usePathname();

    const newpathname = pathname.toLowerCase();

    if (!isAuthenticated) {
      return (
        <FlexColStart className="w-full h-full">
          <FlexColCenter className="w-full h-auto min-h-[70%]">
            {renderIcon(newpathname as any)}
            <FlexColCenter className="gap-4 text-center px-6 mt-2">
              <h1 className="font-ppB text-lg text-dark-100">
                {newpathname === "account"
                  ? "Account Details"
                  : newpathname === "home"
                    ? "NexusAI"
                    : "Conversations"}
              </h1>
              <h1 className="font-ppReg text-sm text-white-400">
                {newpathname === "account"
                  ? "Create an account to get started"
                  : newpathname === "home"
                    ? "AI-powered Chatbot created by Nexus to help deal with customer support."
                    : "No conversations found. Create an account to get started."}
              </h1>
              <button className="w-[180px] px-5 py-3 rounded-full flex-center gap-3 font-ppReg text-xs text-white-100 bg-dark-100 enableBounceEffect">
                <User size={20} className="stroke-white-100" />
                <span>Create Account</span>
              </button>
            </FlexColCenter>
          </FlexColCenter>
        </FlexColStart>
      );
    } else {
      if (newpathname === "home") {
        return (
          <FlexColStart className="w-full h-full">
            <FlexColCenter className="w-full h-auto min-h-[70%]">
              {renderIcon(newpathname as any)}
              <FlexColCenter className="gap-4 text-center px-6 mt-2">
                <h1 className="font-ppB text-lg text-dark-100">NexusAI</h1>
                <h1 className="font-ppReg text-sm text-white-400">
                  AI-powered Chatbot created by Nexus to help deal with customer
                  support.
                </h1>
                <button className="w-[200px] px-5 py-3 rounded-full flex-center gap-3 font-ppReg text-xs text-white-100 bg-dark-100 enableBounceEffect">
                  <span>Start a conversation</span>
                  <SendHorizontal size={20} className="stroke-white-100" />
                </button>
              </FlexColCenter>
            </FlexColCenter>
          </FlexColStart>
        );
      }
    }
    return <Component {...props} />;
  };

  return ComponentModified;
}

function renderIcon(page: "account" | "conversations" | "home") {
  switch (page) {
    case "account":
      return <User size={60} className="stroke-dark-100" />;
    case "conversations":
      return <MessagesSquare size={60} className="stroke-dark-100" />;
    case "home":
      return (
        <img
          width={80}
          src={"/assets/images/logos/nexus-dark.svg"}
          className="rounded-full"
        />
      );
    default:
      return null;
  }
}
