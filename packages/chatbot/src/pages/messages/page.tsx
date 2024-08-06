import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowEndCenter,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { FullPageLoader } from "@/components/Loader";
import NexusTradeMark from "@/components/NexusTradeMark";
import ProtectPage from "@/components/ProtectPage";
import { Spinner } from "@/components/Spinner";
import { useDataCtx } from "@/context/DataCtx";
import {
  getConvMessages,
  processLastUserQuery,
  requestHumanSupport,
  sendUserQuery,
} from "@/http/requests";
import { cn, formatDate } from "@/lib/utils";
import type {
  ChatBotConfig,
  IConversationMessages,
  ResponseData,
} from "@/types";
import {
  ArrowLeft,
  BellRing,
  ChevronDown,
  Inbox,
  RefreshCw,
  Send,
  X,
} from "@components/icons";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMatch, useNavigate } from "react-router-dom";
import { Remarkable } from "remarkable";

const markdown = new Remarkable();

function Messages() {
  const { account } = useDataCtx();
  const router = useNavigate();
  const match = useMatch("/:agent_id/conversation/:conversation_id");
  const params = match?.params;
  const [pageloading, setPageLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [initProcessingLastQuery, setInitProcessingLastQuery] =
    useState<boolean>(false);
  const [convMessages, setConvMessages] =
    useState<IConversationMessages | null>(null);
  const getConversationMessagesMut = useMutation({
    mutationFn: async (data: { agent_id: string; convId: string }) =>
      await getConvMessages(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setConvMessages(resp.data);
      setPageLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const sendUserQueryMut = useMutation({
    mutationFn: async (data: { id: string; query: string }) =>
      await sendUserQuery(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      const customerResponse = resp.data["customer"];
      setQuery("");
      setConvMessages((prev) => ({
        ...prev!,
        messages: [...prev!.messages, customerResponse],
      }));
      setTimeout(scrollToBottom, 100);
      setInitProcessingLastQuery(true);

      processlLastUserQueryMut.mutate(params?.conversation_id!);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  // AI
  const processlLastUserQueryMut = useMutation({
    mutationFn: async (conv_id: string) => await processLastUserQuery(conv_id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      const aiResponse = resp.data["agent"];
      if (aiResponse) {
        setConvMessages((prev) => ({
          ...prev!,
          messages: [...prev!.messages, aiResponse],
        }));
      }
      setInitProcessingLastQuery(false);
      setTimeout(scrollToBottom, 100);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      const code = err?.code;
      if (code === "QUERY_ALREADY_PROCESSED") {
        console.log("Query already processed");
      } else if (code === "CONVERSATION_ESCALATED") {
        console.log("Conversation escalated");
      } else toast.error(err.message);
      setInitProcessingLastQuery(false);
    },
  });
  const requestHumanSupportMut = useMutation({
    mutationFn: async (data: { agent_id: string; conversation_id: string }) =>
      await requestHumanSupport(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      toast.success(resp.message);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  // mark a conversation as read

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (params?.agent_id && params?.conversation_id) {
      getConversationMessagesMut.mutate({
        agent_id: params.agent_id,
        convId: params.conversation_id,
      });

      setTimeout(scrollToBottom, 100);
    }
  }, [params?.agent_id, params?.conversation_id]);

  useEffect(() => {
    if (params?.agent_id && params?.conversation_id) {
      const interval = setInterval(() => {
        getConversationMessagesMut.mutate({
          agent_id: params.agent_id!,
          convId: params.conversation_id!,
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [initProcessingLastQuery]);

  if (!params?.agent_id || !params?.conversation_id) {
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

  if (pageloading) {
    return <FullPageLoader showText={false} />;
  }

  return (
    <FlexColStart className="w-full h-screen relative gap-0">
      <FlexRowStartBtw className="w-full h-auto bg-dark-100 px-6 py-5">
        <FlexRowStartCenter className="w-auto gap-3">
          <button
            onClick={() => {
              router(-1);
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-md font-ppM text-white-100">
            {account && account?.chatbotConfig?.brand_name}
          </h1>
        </FlexRowStartCenter>
        <FlexRowEndCenter className="w-full">
          <button
            className={cn(
              " enableBounceEffect",
              getConversationMessagesMut.isPending ? "animate-spin" : ""
            )}
            onClick={() => {
              getConversationMessagesMut.mutate({
                agent_id: params?.agent_id!,
                convId: params?.conversation_id!,
              });
            }}
            disabled={getConversationMessagesMut.isPending}
          >
            <RefreshCw size={18} />
          </button>
          <button className=" enableBounceEffect">
            <X size={20} />
          </button>
        </FlexRowEndCenter>
      </FlexRowStartBtw>

      {/* messages */}
      <br />
      <FlexColStart className="w-full h-screen overflow-y-auto hideScrollBar mt-0 px-4 gap-5 pb-[10rem]">
        {convMessages && convMessages?.messages.length > 0 && (
          <MessageList
            messages={{
              admin_in_control: convMessages?.admin_in_control!,
              messages: convMessages?.messages ?? [],
            }}
            data_name="messages"
          />
        )}

        {/* request human support */}
        {!convMessages?.admin_in_control && (
          <button
            className="w-auto fixed bottom-[8em] right-5 px-4 py-2 rounded-lg bg-white-300 flex-center gap-3 enableBounceEffect border-[.5px] border-white-400/40 disabled:opacity-[.5] disabled:cursor-not-allowed"
            onClick={() => {
              requestHumanSupportMut.mutate({
                agent_id: params?.agent_id!,
                conversation_id: params?.conversation_id!,
              });
            }}
            disabled={requestHumanSupportMut.isPending}
          >
            {requestHumanSupportMut.isPending ? (
              <Spinner size={20} color="#000" />
            ) : (
              <BellRing size={20} className="stroke-dark-100" />
            )}
            <span className="text-xs font-ppM text-dark-100">
              Request human support
            </span>
          </button>
        )}

        {/* scroll to bottom */}
        <button
          className={cn(
            "w-[35px] h-[35px] fixed right-5 rounded-full bg-transparent flex-center gap-3 enableBounceEffect border-[.5px] border-white-400/40 backdrop-blur-md",
            !convMessages?.admin_in_control
              ? "bottom-[11em] scale-[.80]"
              : "bottom-[8em]"
          )}
          onClick={scrollToBottom}
        >
          <ChevronDown size={20} className="stroke-dark-100" />
        </button>

        <div ref={messagesEndRef} data-name="scroll-to-bottom" />

        {/* ai response loading animation */}
        <FlexRowStartCenter
          className={cn(
            "w-full h-auto mt-2 transition-all",
            processlLastUserQueryMut.isPending ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            width={40}
            className="rounded-full"
            src={"/assets/images/logos/nexus-dark.svg"}
          />
          <div className="dot-pulse ml-5" />
        </FlexRowStartCenter>
      </FlexColStart>

      <FlexColCenter className="w-full h-[100px] absolute bottom-5 left-0 z-[10] backdrop-blur-sm gap-0">
        <div className="w-full px-5">
          <FlexRowCenter className="w-full h-[60px] shadow-sm border-[.5px] border-white-400/30 rounded-full bg-white-100 overflow-hidden">
            <input
              type="text"
              className="w-full h-full bg-transparent outline-none px-8 font-ppReg disabled disabled:cursor-not-allowed disabled:opacity-[.5] text-sm"
              placeholder="Type a message..."
              disabled={
                sendUserQueryMut.isPending || processlLastUserQueryMut.isPending
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  sendUserQueryMut.mutate({
                    id: params?.conversation_id!,
                    query,
                  });
                  scrollToBottom();
                }
              }}
              autoFocus
            />
            <button
              className="w-[80px] h-[60px] bg-dark-100 text-white-100 flex-center rounded-full enableBounceEffect scale-[.80] disabled disabled:cursor-not-allowed disabled:opacity-[.5]"
              disabled={
                sendUserQueryMut.isPending || processlLastUserQueryMut.isPending
              }
              onClick={() => {
                sendUserQueryMut.mutate({
                  id: params?.conversation_id!,
                  query,
                });
                scrollToBottom();
              }}
            >
              <Send size={20} className="stroke-white-100" />
            </button>
          </FlexRowCenter>
        </div>
        <NexusTradeMark />
      </FlexColCenter>
    </FlexColStart>
  );
}

export default ProtectPage(Messages);

interface MessageListProps {
  messages: IConversationMessages | null;
  data_name?: string;
}

const MessageList = ({ messages, data_name }: MessageListProps) => {
  const { account } = useDataCtx();
  const renderMessage = (arg: {
    msg: IConversationMessages["messages"][0];
    i: number;
    chatbotConfig: ChatBotConfig | undefined;
  }) => {
    const { msg, i, chatbotConfig } = arg;
    if (!msg.message || msg.message.length === 0) return null;

    const isAgentOrAdmin = ["agent", "admin"].includes(msg.sender?.role);
    return (
      <MessageListItem
        key={i}
        role={msg.sender?.role}
        pos={!isAgentOrAdmin ? "right" : "left"}
        message={msg.message}
        date={msg.date!}
        agent_config={isAgentOrAdmin ? chatbotConfig : undefined}
        admin_name={
          isAgentOrAdmin
            ? (msg.sender?.name ?? msg?.sender?.fullname)
            : undefined
        }
        customer_name={!isAgentOrAdmin ? msg.sender?.name : undefined}
        avatar={msg.sender?.avatar}
        data_name={data_name}
        agent_name={
          msg.sender?.role === "agent" ? msg.sender?.name! : undefined
        }
      />
    );
  };

  const renderNoMessages = () => (
    <FlexColCenter className="w-full h-full gap-0">
      <div className="w-[80px] h-[80px] p-2 rounded-full bg-brown-100/20 flex-center scale-[.80]">
        <Inbox size={35} className="stroke-white-400" />
      </div>
      <h1 className="text-sm font-ppM text-dark-100 mt-3">No Messages</h1>
      <p className="text-xs font-ppReg text-white-400">
        Start a conversation with the agent.
      </p>
    </FlexColCenter>
  );

  return (
    <>
      {messages && messages?.messages.length > 0
        ? messages.messages.map((msg, i) => {
            return renderMessage({
              msg,
              i,
              chatbotConfig: account?.chatbotConfig!,
            });
          })
        : renderNoMessages()}
    </>
  );
};

interface MessageListItemProps {
  role: "customer" | "agent" | "admin";
  pos: "left" | "right";
  message: string;
  date: string;
  admin_name?: string | null;
  customer_name?: string | null;
  avatar?: string | null;
  agent_name?: string;
  agent_config?: {
    brand_color: string;
    text_color: string;
  };
  data_name?: string;
}

function MessageListItem({
  role,
  message,
  date,
  admin_name,
  customer_name,
  agent_name,
  pos,
  avatar,
  agent_config,
  data_name,
}: MessageListItemProps) {
  const chatAvatar = (
    <img
      width={40}
      className="rounded-full"
      src={
        role === "agent"
          ? "/assets/images/logos/nexus-dark.svg"
          : role === "admin"
            ? (avatar ??
              `https://api.dicebear.com/9.x/initials/svg?seed=${admin_name}`)
            : `https://api.dicebear.com/9.x/initials/svg?seed=${customer_name}`
      }
    />
  );

  const messageListContainer = document.querySelectorAll(
    ".message-list-item-container"
  );

  Array.from(messageListContainer).forEach((elm) => {
    const allLinks = elm.querySelectorAll("a");
    if (allLinks.length > 0) {
      allLinks.forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.onclick = () =>
          window.open(link.href, "_blank", "noopener noreferrer");
      });
    }
  });

  return (
    <>
      {pos === "left" ? (
        <FlexRowStart
          className={cn("w-full h-auto mt-2 message-list-item-container")}
        >
          {chatAvatar}
          <FlexColStart className="w-auto gap-0">
            {/* date/time */}
            <span className="text-xs font-ppReg text-white-400/80">
              {role === "admin" ? admin_name : (agent_name ?? "")} -{" "}
              {formatDate(date)}
            </span>
            <FlexColStart
              className={cn(
                "w-auto max-w-[600px] p-2 rounded-tr-md rounded-br-md rounded-bl-md",
                role == "agent" ? "bg-dark-100" : "bg-white-300/20"
              )}
              style={{
                backgroundColor:
                  role === "agent"
                    ? (agent_config?.brand_color ?? "#000")
                    : "#ebebebb6",
              }}
              data-name={data_name}
            >
              <div
                className="w-auto font-ppReg text-sm"
                style={{
                  color:
                    role === "agent"
                      ? (agent_config?.text_color ?? "#fff")
                      : "#000",
                }}
                dangerouslySetInnerHTML={{
                  __html: markdown.render(message),
                }}
                data-name={data_name}
              />
            </FlexColStart>
          </FlexColStart>
        </FlexRowStart>
      ) : (
        <FlexRowEnd
          className={cn("w-full h-auto mt-2 message-list-item-container")}
        >
          <FlexColEnd className="w-auto max-w-[450px] gap-0">
            <span className="text-xs font-ppReg text-white-400/80">
              {formatDate(date)}
            </span>
            <FlexColEnd
              className={cn(
                "w-auto max-w-[600px] p-2 rounded-tl-md rounded-bl-md rounded-br-md",
                role == "agent" ? "bg-dark-100" : "bg-white-300/20"
              )}
              style={{
                backgroundColor:
                  role === "agent"
                    ? (agent_config?.brand_color ?? "#000")
                    : "#ebebebb6",
              }}
              data-name={data_name}
            >
              <div
                className="w-auto font-ppReg text-sm"
                style={{
                  color:
                    role === "agent"
                      ? (agent_config?.text_color ?? "#fff")
                      : "#000",
                }}
                dangerouslySetInnerHTML={{
                  __html: markdown.render(message),
                }}
                data-name={data_name}
              />
            </FlexColEnd>
          </FlexColEnd>
          {chatAvatar}
        </FlexRowEnd>
      )}
    </>
  );
}
