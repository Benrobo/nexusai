import { useDataCtx } from "@/context/DataCtx";
import { FlexColCenter } from "./Flex";
import { FullPageLoader } from "./Loader";
import ChatWidgetAuthPage from "@/pages/auth/page";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { agent_id, pageLoading } = useDataCtx();

  if (pageLoading) {
    return <FullPageLoader showText={true} fixed={true} />;
  }

  if (!agent_id) {
    return (
      <FlexColCenter className="w-full h-screen gap-1">
        <h1 className="text-sm font-ppM text-dark-100">
          Invalid Chatbot Widget Configuration
        </h1>
        <p className="text-xs font-ppReg text-white-400">
          Something went wrong with the chatbot widget configuration.
        </p>
      </FlexColCenter>
    );
  }

  return (
    <>
      {children}

      <ChatWidgetAuthPage />
    </>
  );
}
