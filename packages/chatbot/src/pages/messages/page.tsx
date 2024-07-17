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
import NexusTradeMark from "@/components/NexusTradeMark";
import { cn, formatDate } from "@/lib/utils";
import type { IConversationMessages, IConversations } from "@/types";
import { ArrowLeft, Inbox, RefreshCw, Send, X } from "@components/icons";
import { Remarkable } from "remarkable";

const markdown = new Remarkable();

export default function Messages() {
  return (
    <FlexColStart className="w-full h-screen relative gap-0">
      <FlexRowStartBtw className="w-full h-auto bg-dark-100 px-6 py-5">
        <FlexRowStartCenter className="w-auto gap-3">
          <ArrowLeft size={20} />
          <h1 className="text-md font-ppM text-white-100">Cassie</h1>
        </FlexRowStartCenter>
        <FlexRowEndCenter className="w-full">
          <button className=" enableBounceEffect">
            <RefreshCw size={18} />
          </button>
          <button className=" enableBounceEffect">
            <X size={20} />
          </button>
        </FlexRowEndCenter>
      </FlexRowStartBtw>

      {/* messages */}
      <br />
      <FlexColStart className="w-full h-screen overflow-y-auto hideScrollBar mt-0 px-4 gap-5 pb-[15rem]">
        {/* first agent message */}
        <MessageList
          selectedConversation={{
            messages: [
              {
                agent_id: "sdcsdc",
                date: "2021-09-01T12:00:00Z",
                message: "Hello, how may I help you?",
                sender: {
                  name: "Cassie",
                  role: "agent",
                  id: "sdcsdc",
                  // avatar: "",
                },
              },
              {
                agent_id: "sdcsdc",
                date: "2021-09-01T12:00:00Z",
                message: "I need some help concerning your system",
                sender: {
                  name: "John Bosko",
                  role: "customer",
                  id: "sdcsdc",
                  // avatar: "",
                },
              },
              {
                agent_id: "sdcsdc",
                date: "2021-09-01T12:00:00Z",
                message: "I need some help concerning your system",
                sender: {
                  name: "Benrobo",
                  role: "admin",
                  id: "sdcsdc",
                  // avatar: "",
                },
              },
            ],
            admin_in_control: false,
            conv_id: "sdcsdcdsc",
            customer_info: {
              name: "John Doe",
              email: "brad@mail.com",
              city: "",
              state: "",
              country_code: "",
            },
          }}
          conversations={null}
          data_name="messages"
        />
      </FlexColStart>

      <FlexColCenter className="w-full h-[100px] absolute bottom-5 left-0 z-[10] backdrop-blur-sm gap-0">
        <div className="w-full px-5">
          <FlexRowCenter className="w-full h-[60px] shadow-sm border-[.5px] border-white-400/30 rounded-full bg-white-100 overflow-hidden">
            <input
              type="text"
              className="w-full h-full bg-transparent outline-none px-8 font-ppReg disabled disabled:cursor-not-allowed disabled:opacity-[.5] text-sm"
              placeholder="Type a message..."
              // disabled={
              //   !selectedConversation?.admin_in_control ||
              //   replyToConversationMut.isPending
              // }
              // value={query}
              // onChange={(e) => setQuery(e.target.value)}
              // onKeyUp={(e) => {
              //   if (e.key === "Enter") {
              //     replyToConversationMut.mutate({
              //       id: selectedConversationId,
              //       response: query,
              //     });
              //     scrollToBottom();
              //     scrollToBottom();
              //   }
              // }}
            />
            <button
              className="w-[80px] h-[60px] bg-dark-100 text-white-100 flex-center rounded-full enableBounceEffect scale-[.80] disabled disabled:cursor-not-allowed disabled:opacity-[.5]"
              // disabled={
              //   !selectedConversation?.admin_in_control ||
              //   replyToConversationMut.isPending
              // }
              // onClick={() => {
              //   replyToConversationMut.mutate({
              //     id: selectedConversationId,
              //     response: query,
              //   });
              // }}
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

interface MessageListProps {
  selectedConversation: IConversationMessages | null;
  conversations: IConversations | null;
  data_name?: string;
}

const MessageList = ({
  selectedConversation,
  conversations,
  data_name,
}: MessageListProps) => {
  const renderMessage = (arg: {
    msg: IConversationMessages["messages"][0];
    i: number;
    chatbotConfig: IConversations["chatbot_config"][0] | undefined;
  }) => {
    const { msg, i, chatbotConfig } = arg;
    if (!msg.message || msg.message.length === 0) return null;

    const isAgentOrAdmin = ["agent", "admin"].includes(msg.sender?.role);
    return (
      <MessageListItem
        key={i}
        role={msg.sender?.role}
        pos={isAgentOrAdmin ? "left" : "right"}
        message={msg.message}
        date={msg.date}
        agent_config={isAgentOrAdmin ? chatbotConfig : undefined}
        admin_name={isAgentOrAdmin ? msg.sender?.name : undefined}
        customer_name={!isAgentOrAdmin ? msg.sender?.name : undefined}
        avatar={msg.sender?.avatar}
        data_name={data_name}
        agent_name={msg.sender?.role === "agent" ? msg.sender?.name : undefined}
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
      {selectedConversation && selectedConversation?.messages.length > 0
        ? selectedConversation.messages.map((msg, i) => {
            const chatbotConfig = conversations?.chatbot_config.find(
              (c) => c.agent_id === msg.agent_id
            );
            return renderMessage({
              msg,
              i,
              chatbotConfig,
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

  return (
    <>
      {pos === "left" ? (
        <FlexRowStart className={cn("w-full h-auto mt-2")}>
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
        <FlexRowEnd className={cn("w-full h-auto mt-2")}>
          <FlexColEnd className="w-auto max-w-[450px] gap-0">
            {/* date/time */}
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
