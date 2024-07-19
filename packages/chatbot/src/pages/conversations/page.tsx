import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowStart,
  FlexRowStartBtw,
} from "@/components/Flex";
import {
  ListFilter,
  MessagesSquare,
  SendHorizontal,
  Undo,
} from "@/components/icons";
import { FullPageLoader } from "@/components/Loader";
import ProtectPage from "@/components/ProtectPage";
import { useDataCtx } from "@/context/DataCtx";
import { getConversations } from "@/http/requests";
import { cn, formatDate } from "@/lib/utils";
import type { IConversations, ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Remarkable } from "remarkable";

const markdown = new Remarkable();

function Conversations() {
  const { agent_id } = useDataCtx();
  const [pageloading, setPageLoading] = useState<boolean>(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [conversations, setConversations] = useState<IConversations | null>(
    null
  );
  const getConversationsMut = useMutation({
    mutationFn: async (id: string) => getConversations(id),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setConversations(resp.data);
      setPageLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
      setPageLoading(false);
    },
  });

  useEffect(() => {
    if (agent_id) getConversationsMut.mutate(agent_id);
  }, [agent_id]);

  if (pageloading) {
    return <FullPageLoader showText={false} />;
  }

  if (
    !pageloading &&
    (!conversations || conversations?.conversations.length === 0)
  ) {
    return (
      <FlexColCenter className="w-full h-auto min-h-[70%]">
        <MessagesSquare size={60} className="stroke-dark-100" />
        <FlexColCenter className="gap-4 text-center px-6 mt-2">
          <h1 className="font-ppB text-lg text-dark-100">Conversations</h1>
          <h1 className="font-ppReg text-sm text-white-400">
            No conversations found.
          </h1>
          <button
            className="w-[200px] px-5 py-3 rounded-full flex-center gap-3 font-ppReg text-xs text-white-100 bg-dark-100 enableBounceEffect"
            onClick={() => {}}
          >
            <span>Start a conversation</span>
            <SendHorizontal size={20} className="stroke-white-100" />
          </button>
        </FlexColCenter>
      </FlexColCenter>
    );
  }

  return (
    <FlexColStart className="w-full h-full">
      {/* header */}
      <FlexRowStartBtw className="w-full h-auto px-7 py-6">
        <FlexColStart className="w-auto gap-0">
          <h1 className="text-md font-ppM text-dark-100">All Conversations</h1>
          <p className="text-xs font-ppReg text-white-400">
            All conversations across all nexusai agents are displayed here.
          </p>
        </FlexColStart>
        <button className="enableBounceEffect">
          <ListFilter size={15} className="stroke-white-400" strokeWidth={3} />
        </button>
      </FlexRowStartBtw>

      <br />
      <FlexColStart className="w-full h-full px-7">
        {conversations?.conversations.map((conv) => (
          <ConversationList
            key={conv.id}
            conv_id={conv.id}
            message={conv.lastMsg.message}
            time={conv.lastMsg.date}
            unread={
              conversations?.unread_messages.find((i) => i.conv_id === conv.id)
                ?.unread ?? 0
            }
            user={{
              name: conv.lastMsg.sender.fullname! ?? conv.lastMsg?.sender.name!,
              avatar: conv.lastMsg?.sender?.avatar,
            }}
            selectedConversationId={selectedConversationId}
            agent_id={conv.agentId}
          />
        ))}
        {/*  */}
      </FlexColStart>
    </FlexColStart>
  );
}

interface ConversationListProps {
  conv_id: string;
  message: string;
  time: string;
  unread: number;
  user: {
    name: string;
    avatar?: string;
  };
  onSelect?: (id: string) => void;
  selectedConversationId?: string | null;
  agent_id: string;
}

function ConversationList({
  conv_id,
  message,
  time,
  unread,
  user,
  selectedConversationId,
  agent_id,
}: ConversationListProps) {
  return (
    <Link className="w-full" to={`/${agent_id}/conversation/${conv_id}`}>
      <FlexRowStart
        className={cn(
          "w-full h-auto px-4 py-5 rounded-[25px] gap-1 hover:bg-white-400/10 transition-all",
          selectedConversationId === conv_id && "bg-white-400/10"
        )}
      >
        <img
          width={45}
          src={
            user?.avatar ??
            `https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`
          }
          className="rounded-xl"
        />
        <FlexColStart className="w-full gap-1 ml-1">
          <h1 className="text-sm font-ppB text-dark-100">
            {user.name
              ? user.name?.slice(0, 1).toUpperCase() + user?.name.slice(1)
              : "N/A"}
          </h1>
          {/* <p className="text-xs font-ppReg text-white-400">
            Hi, how can i help you today..
          </p> */}
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
        <FlexColEnd className="w-full">
          <span className="text-xs font-ppReg text-white-400">
            {formatDate(time)}
          </span>
          {unread > 0 ? (
            <div className="w-5 h-5 text-[10px] font-ppM flex items-center justify-center rounded-full bg-blue-101 text-white-100 scale-[1]">
              {unread}
            </div>
          ) : (
            <Undo
              className="rotate-180 stroke-white-400/50"
              size={15}
              strokeWidth={3}
            />
          )}
        </FlexColEnd>
      </FlexRowStart>
    </Link>
  );
}

export default ProtectPage(Conversations);
