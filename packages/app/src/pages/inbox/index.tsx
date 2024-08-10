import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowCenter,
  FlexRowCenterBtw,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import {
  Bot,
  ElipsisVertical,
  Inbox,
  Mail,
  MapPin,
  PersonStanding,
  Send,
  Trash,
  User,
  X,
} from "@/components/icons";
import { FullPageLoader } from "@/components/Loader";
import TooltipComp from "@/components/TooltipComp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getConversationMessages,
  getConversations,
  markConversationRead,
  replyToConversation,
  deleteConversation,
  switchConversationControl,
} from "@/http/requests";
import { cn, formatDate } from "@/lib/utils";
import type { ResponseData } from "@/types";
import type { IConversationMessages, IConversations } from "@/types/inbox.type";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Remarkable } from "remarkable";
import countryJson from "@/data/country.json";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@/components/Spinner";

const markdown = new Remarkable();

dayjs.extend(relativeTime);

export default function InboxPage() {
  const { conversation_id } = useParams();
  const router = useNavigate();
  const [conversations, setConversations] = useState<IConversations | null>(
    null
  );
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversation_id ?? null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<IConversationMessages | null>(null);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState({
    messages: false,
    initiaConversations: false,
    newConversations: false,
  });
  const getConversationsQuery = useMutation({
    mutationFn: async () => await getConversations(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      const sortedConversations = (
        resp.data as IConversations
      ).conversations.sort(
        (a: any, b: any) =>
          new Date(b?.lastMsg.date).getTime() -
          new Date(a.lastMsg.date).getTime()
      );

      setConversations({
        ...resp.data,
        conversations: sortedConversations,
      });
      setLoading((prev) => ({ ...prev, initiaConversations: false }));
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
      setLoading((prev) => ({ ...prev, initiaConversations: false }));
    },
  });
  const getConversationMessagesMut = useMutation({
    mutationFn: async (id: string) => await getConversationMessages(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setSelectedConversation(resp.data);
      setLoading((prev) => ({ ...prev, messages: false }));
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
      setLoading((prev) => ({ ...prev, messages: false }));
    },
  });
  const replyToConversationMut = useMutation({
    mutationFn: async (data: { id: string; response: string }) =>
      replyToConversation(data),
    onSuccess: (data: any) => {
      const resp = data as ResponseData;
      const msgData = resp.data;
      setSelectedConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, msgData],
        };
      });
      setQuery("");
      setTimeout(scrollToBottom, 100);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const markConversationReadMut = useMutation({
    mutationFn: async (id: string) => await markConversationRead(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      const readMessages = resp.data["read_messages"];
      const modifiedConv = {
        ...conversations,
        unread_messages: conversations?.unread_messages.map((ur) => {
          if (ur.conv_id === readMessages.conv_id) {
            ur.unread = 0;
          }
          return ur;
        }),
      };

      setConversations(modifiedConv as any);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      console.error(err);
    },
  });
  const switchConvControlMut = useMutation({
    mutationFn: async (id: string) => await switchConversationControl(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      toast.success(resp?.message);
      getConversationMessagesMut.mutate(selectedConversationId!);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      console.error(err);
    },
  });
  const deleteConversationMut = useMutation({
    mutationFn: async (id: string) => await deleteConversation(id),
    onSuccess: () => {
      router({
        pathname: "/inbox",
      });
      getConversationsQuery.mutate();
      setSelectedConversationId(null);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err?.message ?? "An error occurred");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    getConversationsQuery.mutate();
    setLoading((prev) => ({ ...prev, initiaConversations: true }));
  }, []);

  useEffect(() => {
    if (conversation_id) {
      setLoading((prev) => ({ ...prev, messages: true }));
      getConversationMessagesMut.mutate(conversation_id!);
      markConversationReadMut.mutate(conversation_id!);
    }
  }, [conversation_id]);

  useEffect(() => {
    if (!conversation_id) setSelectedConversationId(null);
    if (conversation_id) {
      setTimeout(() => {
        scrollToBottom();
      }, 1000);
      setSelectedConversationId(conversation_id);

      const interval = setInterval(() => {
        getConversationMessagesMut.mutate(conversation_id!);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [conversation_id]);

  if (
    (!loading.initiaConversations && !conversations) ||
    conversations?.conversations.length === 0
  ) {
    return (
      <FlexColCenter className="w-full h-full gap-0">
        <div className="w-[80px] h-[80px] p-2 rounded-full bg-brown-100 flex-center">
          <Inbox size={35} className={"stroke-white-100"} />
        </div>
        <h1 className="text-lg font-ppB text-dark-100 mt-3">No Inbox</h1>
        <p className="text-sm font-ppReg text-white-400">
          You have no inbox yet.
        </p>
      </FlexColCenter>
    );
  }

  const getLocation = () => {
    if (!selectedConversation) return;
    const { city, country_code, state } = selectedConversation?.customer_info;
    let locationStr: null | string = null;
    if (city) locationStr = city;
    if (state) locationStr += `, ${state}`;
    if (country_code) {
      const country = countryJson.find((c) => c.code === country_code);
      locationStr += `, ${country?.name} ${country?.emoji}`;
    }
    return locationStr;
  };

  return (
    <FlexRowStart className="w-full h-screen relative gap-0">
      {/* conversation lists */}
      <FlexColStart className="w-full h-screen max-w-[350px] gap-0 bg-white-300">
        {/* header */}
        <FlexRowStartBtw className="w-full h-[90px] px-3 py-4 bg-white-300">
          <Select>
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder={"All Agents"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                key={1}
                value={"all_agents"}
                className="font-ppM font-"
              >
                All Agents
              </SelectItem>
            </SelectContent>
          </Select>
        </FlexRowStartBtw>

        {/* message lists */}
        {loading.initiaConversations ? (
          <FlexColCenter className="w-full">
            <Spinner color="#000" />
          </FlexColCenter>
        ) : (
          <FlexColStart className="w-full border-t-[.5px] gap-0 p-0">
            {conversations?.conversations.map((conv) => (
              <MessageItem
                key={conv.id}
                conv_id={conv.id}
                message={conv?.lastMsg?.message}
                time={conv.lastMsg.date}
                unread={
                  conversations.unread_messages.find(
                    (ur) => ur.conv_id === conv.id
                  )?.unread ?? 0
                }
                user={{
                  name:
                    conv.lastMsg.sender.role === "admin"
                      ? conv.lastMsg.sender.fullname!
                      : conv?.lastMsg?.sender?.name!,
                  avatar:
                    conv.lastMsg.sender.role === "agent"
                      ? "/assets/logo/nexus-dark.svg"
                      : conv.lastMsg?.sender?.avatar,
                }}
                onSelect={(id) => {
                  if (selectedConversationId === id) return;
                  setSelectedConversationId(id);
                  markConversationReadMut.mutate(id);
                }}
                selectedConversation={selectedConversationId}
              />
            ))}
          </FlexColStart>
        )}
      </FlexColStart>

      {/* selected conversation */}
      <FlexColStart
        className="w-full max-w-[850px] h-screen bg-white-100 relative gap-0"
        data-name="selected-conversation-area"
      >
        {selectedConversationId ? (
          loading.messages ? (
            <FullPageLoader blur={false} showText={false} />
          ) : selectedConversation && !loading.messages ? (
            <>
              <FlexRowCenterBtw className="w-full h-[96px] px-5 py-4 border-b-white-400/30 border-b-[.5px]">
                <FlexColStart className="w-full max-w-[150px] gap-1">
                  <h1 className="font-ppB text-xl text-dark-100">
                    {selectedConversation?.customer_info?.name}
                  </h1>
                  <p className="font-ppReg text-sm text-white-400/50">
                    Sent{" "}
                    <span className="font-ppM text-white-400">
                      {formatDate(selectedConversation?.messages[0].date)}
                    </span>
                  </p>
                </FlexColStart>

                <FlexRowEnd className="w-auto">
                  <FlexRowEnd className="w-auto relative">
                    <div
                      className={cn(
                        "overflow-hidden h-full flex-center gap-2 transition-all duration-100 ease-in-out absolute right-4",
                        !more ? "w-0" : "w-[100px]"
                      )}
                    >
                      <button
                        className="w-[30px] h-[30px] rounded-full bg-white-300/80 enableBounceEffect flex items-center justify-center"
                        onClick={() => {
                          setMore(false);
                          setTimeout(() => {
                            setSelectedConversationId(null);
                            setSelectedConversation(null);
                            router({
                              pathname: "/inbox",
                            });
                          }, 200);
                        }}
                      >
                        <X
                          size={20}
                          strokeWidth={3}
                          className="stroke-red-305"
                        />
                      </button>
                      <button
                        className={cn(
                          "w-[30px] h-[30px] rounded-full bg-white-300/80 enableBounceEffect flex items-center justify-center disabled:opacity-[.5] disabled:cursor-not-allowed",
                          deleteConversationMut.isPending && "animate-pulse"
                        )}
                        onClick={() => {
                          const confirm = window.confirm(
                            "Are you sure you want to delete this conversation?"
                          );
                          if (!confirm) return;

                          deleteConversationMut.mutate(selectedConversationId);
                        }}
                        disabled={deleteConversationMut.isPending}
                      >
                        <Trash
                          size={16}
                          strokeWidth={2}
                          className="stroke-red-305"
                        />
                      </button>
                    </div>
                    <button
                      className="w-[30px] h-[30px] rounded-full bg-white-300/80 enableBounceEffect flex items-center justify-center"
                      onClick={() => setMore(!more)}
                    >
                      <ElipsisVertical
                        size={20}
                        strokeWidth={3}
                        className="stroke-white-400 rotate-90"
                      />
                    </button>
                  </FlexRowEnd>

                  <TooltipComp
                    text={
                      selectedConversation?.admin_in_control
                        ? "Return control to bot"
                        : "Take control of conversation"
                    }
                  >
                    <button
                      className={cn(
                        "w-auto h-auto px-3 py-1 rounded-md bg-white-300/80 enableBounceEffect flex items-center justify-center disabled:opacity-[.5] disabled:cursor-not-allowed gap-1",
                        selectedConversation?.admin_in_control
                          ? "bg-blue-101 text-white-100"
                          : "text-dark-100"
                      )}
                      disabled={switchConvControlMut.isPending}
                      onClick={() => {
                        switchConvControlMut.mutate(selectedConversationId);
                      }}
                    >
                      <span className="text-xs font-ppReg">
                        {selectedConversation?.admin_in_control
                          ? "Release control"
                          : "Take control"}
                      </span>
                      {!selectedConversation?.admin_in_control ? (
                        <PersonStanding
                          size={20}
                          strokeWidth={2}
                          className={cn("stroke-white-400")}
                        />
                      ) : (
                        <Bot
                          size={20}
                          strokeWidth={2}
                          className={cn("stroke-white-100")}
                        />
                      )}
                    </button>
                  </TooltipComp>
                </FlexRowEnd>
              </FlexRowCenterBtw>

              {/* messages */}
              <FlexColStart className="w-full h-screen overflow-y-auto hideScrollBar mt-0 px-4 gap-5 pb-[15rem]">
                <MessageList
                  selectedConversation={selectedConversation}
                  conversations={conversations}
                  data-name="selected-conversation-messages"
                />
                <div ref={messagesEndRef} data-name="scroll-to-bottom" />
              </FlexColStart>

              {/* input control */}
              <FlexRowStartCenter className="w-full h-[100px] absolute bottom-5 left-0 px-10 z-[10] backdrop-blur-sm">
                <FlexRowCenter className="w-full h-[70px] shadow-xl border-[.5px] border-white-400/30 rounded-full bg-white-100 overflow-hidden">
                  <input
                    type="text"
                    className="w-full h-full bg-transparent outline-none px-8 font-ppReg disabled disabled:cursor-not-allowed disabled:opacity-[.5] text-sm"
                    placeholder="Type a message..."
                    disabled={
                      !selectedConversation?.admin_in_control ||
                      replyToConversationMut.isPending
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        replyToConversationMut.mutate({
                          id: selectedConversationId,
                          response: query,
                        });
                        scrollToBottom();
                        scrollToBottom();
                      }
                    }}
                  />
                  <button
                    className="w-[80px] h-[70px] bg-dark-100 text-white-100 flex-center rounded-full enableBounceEffect scale-[.80] disabled disabled:cursor-not-allowed disabled:opacity-[.5]"
                    disabled={
                      !selectedConversation?.admin_in_control ||
                      replyToConversationMut.isPending
                    }
                    onClick={() => {
                      replyToConversationMut.mutate({
                        id: selectedConversationId,
                        response: query,
                      });
                    }}
                  >
                    <Send size={20} className="stroke-white-100" />
                  </button>
                </FlexRowCenter>
              </FlexRowStartCenter>
            </>
          ) : (
            <FlexColCenter className="w-full h-full gap-0">
              <div className="w-[80px] h-[80px] p-2 rounded-full bg-red-305/50 flex-center scale-[.80]">
                <Inbox size={35} className={"stroke-white-100"} />
              </div>
              <h1 className="text-sm font-ppM text-dark-100 mt-3">
                Conversation NotFound
              </h1>
              <p className="text-xs font-ppReg text-white-400">
                Click on a conversation to view messages
              </p>
            </FlexColCenter>
          )
        ) : (
          <FlexColCenter className="w-full h-full gap-0">
            <div className="w-[80px] h-[80px] p-2 rounded-full bg-brown-100/20 flex-center scale-[.80]">
              <Inbox size={35} className={"stroke-white-400"} />
            </div>
            <h1 className="text-sm font-ppM text-dark-100 mt-3">
              Select a Conversation
            </h1>
            <p className="text-xs font-ppReg text-white-400">
              Click on a conversation to view messages
            </p>
          </FlexColCenter>
        )}
      </FlexColStart>

      {/* user info */}
      <FlexColStart className="w-full h-screen max-w-[250px] gap-0 border-l-[.5px] border-l-white-400/30">
        {selectedConversation && !loading.messages ? (
          <>
            <FlexColCenter className="w-full h-auto min-h-[20%] gap-1">
              <img
                width={100}
                className="rounded-full "
                src={`https://api.dicebear.com/9.x/initials/svg?seed=${selectedConversation?.customer_info?.name}`}
                alt="user"
              />
              <p className="text-lg font-ppB text-dark-100">
                {selectedConversation?.customer_info?.name}
              </p>
              <p className="text-sm font-ppReg text-white-400">
                Sent {dayjs(selectedConversation?.messages[0].date).fromNow()}
              </p>
            </FlexColCenter>

            <br />
            <FlexColStart className="w-full border-t-[.5px] border-t-white-400/30 px-4 py-4 gap-3">
              <p className="text-dark-400 font-ppB text">User Details</p>
              <DetailsCard
                type="email"
                title="Email"
                value={selectedConversation?.customer_info?.email ?? "N/A"}
              />
              <DetailsCard
                type="location"
                title="Location"
                value={getLocation() ?? "N/A"}
              />
            </FlexColStart>
          </>
        ) : (
          <FlexColCenter className="w-full h-full gap-0">
            <div className="w-[80px] h-[80px] p-2 rounded-full bg-brown-100/20 flex-center scale-[.80]">
              <User size={35} className={"stroke-white-400"} />
            </div>
            <h1 className="text-sm font-ppM text-dark-100 mt-3">
              Select a Conversation
            </h1>
            <p className="text-xs font-ppReg text-white-400">
              Click on a conversation to view customer details.
            </p>
          </FlexColCenter>
        )}
      </FlexColStart>
    </FlexRowStart>
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
        Start a conversation with the customer.
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
          ? "/assets/logo/nexus-dark.svg"
          : role === "admin"
            ? avatar ??
              `https://api.dicebear.com/9.x/initials/svg?seed=${admin_name}`
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
                    ? agent_config?.brand_color ?? "#000"
                    : "#ebebebb6",
              }}
              data-name={data_name}
            >
              <div
                className="w-auto font-ppReg text-sm"
                style={{
                  color:
                    role === "agent"
                      ? agent_config?.text_color ?? "#fff"
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
                    ? agent_config?.brand_color ?? "#000"
                    : "#ebebebb6",
              }}
              data-name={data_name}
            >
              <div
                className="w-auto font-ppReg text-sm"
                style={{
                  color:
                    role === "agent"
                      ? agent_config?.text_color ?? "#fff"
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

type DetailsCardType = "email" | "location";
interface DetailsCardProps {
  type: DetailsCardType;
  title: string;
  value: string | null;
}

function DetailsCard({ type, title, value }: DetailsCardProps) {
  const renderIcon = (type: DetailsCardType) => {
    let icon = null;
    switch (type) {
      case "email":
        icon = <Mail size={20} className="stroke-white-400" />;
        break;
      case "location":
        icon = <MapPin size={20} className="stroke-white-400" />;
        break;
      default:
        break;
    }
    return icon;
  };

  return (
    <FlexRowStartBtw className="w-auto mt-2">
      <div className="bg-white-300 p-2 rounded-full">{renderIcon(type)}</div>
      <FlexColStart className="w-auto gap-1">
        <span className="text-white-400 text-sm font-ppM">{title}</span>
        <span className="text-dark-400 text-[12px] font-ppReg">{value}</span>
      </FlexColStart>
    </FlexRowStartBtw>
  );
}

interface IMessageItemProps {
  conv_id: string;
  message: string;
  time: string;
  unread: number;
  user: {
    name: string;
    avatar?: string;
  };
  onSelect?: (id: string) => void;
  selectedConversation?: string | null;
}

function MessageItem({
  message,
  time,
  user,
  unread,
  conv_id,
  selectedConversation,
}: IMessageItemProps) {
  return (
    <Link to={`/inbox/${conv_id}`} className="w-full">
      <FlexRowStartBtw
        className={cn(
          "w-full border-t-[.5px] border-b-[.5px] border-t-white-400/30 border-b-white-400/30 bg-none px-3 py-5",
          unread > 0 && "bg-white-300",
          selectedConversation === conv_id && "bg-white-100"
        )}
      >
        <FlexRowStart className="w-auto gap-2">
          <img
            width={40}
            className="rounded-md"
            src={
              user?.avatar ??
              `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`
            }
            alt="user"
          />
          <FlexColStart className="w-auto gap-1">
            <h1 className="text-sm font-ppB text-dark-100">
              {user.name
                ? user.name?.slice(0, 1).toUpperCase() + user?.name.slice(1)
                : "N/A"}
            </h1>
            <div
              className="text-xs font-ppReg text-dark-200 flex items-start justify-start gap-1 text-start"
              dangerouslySetInnerHTML={{
                __html: markdown.render(
                  message
                    ? message?.length > 40
                      ? message?.slice(0, 40) + "..."
                      : message
                    : "N/A"
                ),
              }}
            ></div>
          </FlexColStart>
        </FlexRowStart>
        <FlexColEnd className="w-auto min-w-[100px] gap-1">
          <p className="text-xs font-ppM text-white-400">{formatDate(time)}</p>
          {unread > 0 && (
            <div className="w-5 h-5 text-[10px] font-ppM flex items-center justify-center rounded-full bg-blue-101 text-white-100 scale-[1]">
              {unread}
            </div>
          )}
        </FlexColEnd>
      </FlexRowStartBtw>
    </Link>
  );
}
