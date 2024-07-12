import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import {
  ElipsisVertical,
  Mail,
  MapPin,
  PersonStanding,
  Send,
} from "@/components/icons";
import TooltipComp from "@/components/TooltipComp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tmpMessages } from "@/data/tmpConversations";
import useSession from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Inbox() {
  const data = useSession();
  const agentConfig = {
    brand_color: "#000",
    text_color: "#fff",
  };
  return (
    <FlexRowStart className="w-full h-screen relative gap-0">
      {/* conversation lists */}
      <FlexColStart className="w-full h-screen max-w-[350px] gap-0 bg-white-300">
        {/* header */}
        <FlexRowStartBtw className="w-full h-[90px] px-3 py-4 bg-white-300">
          <Select
            onValueChange={(val) => {
              // handleFormChange("handover_condition", val);
            }}
          >
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
        <FlexColStart className="w-full border-t-[.5px] gap-0 p-0">
          <MessageItem
            message="Hello, how can I help you today?"
            time={new Date()}
            user={{ name: "John Doe" }}
          />
        </FlexColStart>
      </FlexColStart>

      {/* selected conversation */}
      <FlexColStart className="w-full h-screen bg-white-100 relative">
        <FlexRowStartCenter className="w-full h-[91px] px-5 py-4 border-b-white-400/30 border-b-[.5px]">
          <FlexColStart className="w-full gap-1">
            <h1 className="font-ppB text-xl text-dark-100">John Doe</h1>
            <p className="font-ppReg text-sm text-white-400/50">
              Sent{" "}
              <span className="font-ppM text-white-400">a few seconds ago</span>
            </p>
          </FlexColStart>

          <FlexRowEnd className="w-auto">
            <button className="w-[30px] h-[30px] rounded-full bg-white-300/80 enableBounceEffect flex items-center justify-center">
              <ElipsisVertical
                size={20}
                strokeWidth={3}
                className="stroke-white-400 rotate-90"
              />
            </button>

            <TooltipComp text="Chat Escalation">
              <button className="w-[30px] h-[30px] rounded-full bg-white-300/80 enableBounceEffect flex items-center justify-center">
                <PersonStanding
                  size={20}
                  strokeWidth={3}
                  className="stroke-white-400"
                />
              </button>
            </TooltipComp>
          </FlexRowEnd>
        </FlexRowStartCenter>

        {/* messages */}
        <FlexColStart className="w-full h-full pb-[100em] px-9 py-9 gap-5 overflow-y-scroll hideScrollBar ">
          {tmpMessages.map((msg, i) => {
            if (msg.role === "agent" || msg.role === "admin") {
              return (
                <MessageListItem
                  key={i}
                  role={msg.role}
                  pos={"left"}
                  message={msg.message}
                  date={msg.date}
                  agent_config={agentConfig}
                />
              );
            }

            return (
              <MessageListItem
                key={i}
                role={msg.role as any}
                pos={"right"}
                message={msg.message}
                date={msg.date}
                admin_name={msg.admin_name}
                customer_name={msg.customer_name}
              />
            );
          })}

          {/* spacer */}
          {tmpMessages.length > 5 && (
            <div className="w-full h-[350px] bg-red-200"></div>
          )}
        </FlexColStart>

        {/* input control */}
        <FlexRowStartCenter className="w-full absolute bottom-4 left-0 px-10 z-[10]">
          <FlexRowCenter className="w-full h-[70px] shadow-xl border-[.5px] border-white-400/30 rounded-full bg-white-100 overflow-hidden">
            <input
              type="text"
              className="w-full h-full bg-transparent outline-none px-8 font-ppReg"
              placeholder="Type a message..."
            />
            <button className="w-[75px] h-[70px] bg-dark-100 text-white-100 flex-center rounded-full enableBounceEffect scale-[.80]">
              <Send size={20} className="stroke-white-100" />
            </button>
          </FlexRowCenter>
        </FlexRowStartCenter>
      </FlexColStart>

      {/* user info */}
      <FlexColStart className="w-full h-screen max-w-[350px] gap-0 border-l-[.5px] border-l-white-400/30">
        <FlexColCenter className="w-full h-auto min-h-[20%] gap-1">
          <img
            width={100}
            className="rounded-full "
            src={`https://api.dicebear.com/9.x/initials/svg?seed=ben`}
            alt="user"
          />
          <p className="text-lg font-ppB text-dark-100">John Doe</p>
          <p className="text-sm font-ppReg text-white-400">Sent a week ago</p>
        </FlexColCenter>

        <br />
        <FlexColStart className="w-full border-t-[.5px] border-t-white-400/30 px-4 py-4 gap-3">
          <p className="text-dark-400 font-ppB text">User Details</p>
          <DetailsCard type="email" title="Email" value="johndoe@mail.com" />
          <DetailsCard
            type="location"
            title="Location"
            value="United States, Alabama"
          />
        </FlexColStart>
      </FlexColStart>
    </FlexRowStart>
  );
}

interface MessageListItemProps {
  role: "customer" | "agent" | "admin";
  pos: "left" | "right";
  message: string;
  date: Date;
  admin_name?: string | null;
  customer_name?: string | null;
  agent_config?: {
    brand_color: string;
    text_color: string;
  };
}

function MessageListItem({
  role,
  message,
  date,
  admin_name,
  customer_name,
  pos,
  agent_config,
}: MessageListItemProps) {
  const chatAvatar = (
    <img
      width={40}
      className="rounded-full"
      src={
        role === "agent"
          ? "/assets/logo/nexus-dark.svg"
          : `https://api.dicebear.com/9.x/initials/svg?seed=${role === "admin" ? admin_name : customer_name}`
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
              {dayjs(date).fromNow()}
            </span>
            <FlexColStart
              className={cn(
                "w-full max-w-[600px] p-2 rounded-tr-md rounded-br-md rounded-bl-md",
                role == "agent" ? "bg-dark-100" : "bg-white-300/20"
              )}
              style={{
                backgroundColor:
                  role === "agent"
                    ? agent_config?.brand_color ?? "#000"
                    : "#ebebebb6",
              }}
            >
              {/* content */}
              <p
                className="font-ppReg text-sm"
                style={{
                  color:
                    role === "agent"
                      ? agent_config?.text_color ?? "#fff"
                      : "#000",
                }}
              >
                {message}
              </p>
            </FlexColStart>
          </FlexColStart>
        </FlexRowStart>
      ) : (
        <FlexRowEnd className={cn("w-full h-auto mt-2")}>
          <FlexColEnd className="w-auto gap-0">
            {/* date/time */}
            <span className="text-xs font-ppReg text-white-400/80">
              {dayjs(date).fromNow()}
            </span>
            <FlexColStart
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
            >
              {/* content */}
              <p
                className="font-ppReg text-sm"
                style={{
                  color:
                    role === "agent"
                      ? agent_config?.text_color ?? "#fff"
                      : "#000",
                }}
              >
                {message}
              </p>
            </FlexColStart>
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
  value: string;
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
  message: string;
  time: Date;
  user: {
    name: string;
  };
}

function MessageItem({ message, time, user }: IMessageItemProps) {
  return (
    <button className="w-full outline-none border-none">
      <FlexRowStartBtw
        className={cn(
          "w-full border-t-[.5px] border-b-[.5px] border-t-white-400/30 border-b-white-400/30 bg-none px-3 py-5",
          "bg-white-300"
        )}
      >
        <FlexRowStart className="w-auto gap-2">
          <img
            width={40}
            className="rounded-md"
            src={`https://api.dicebear.com/9.x/initials/svg?seed=${user.name}`}
            alt="user"
          />
          <FlexColStart className="w-auto gap-1">
            <h1 className="text-sm font-ppB text-dark-100">
              {user.name.slice(0, 1).toUpperCase() + user.name.slice(1)}
            </h1>
            <p className="text-xs font-ppReg text-dark-200 flex items-center justify-start gap-1">
              {message.length > 20 ? message.slice(0, 20) + "..." : message}
            </p>
          </FlexColStart>
        </FlexRowStart>
        <FlexColEnd className="w-auto gap-1">
          <p className="text-xs font-ppM text-white-400">
            {dayjs(time).fromNow()}
          </p>
          <div className="w-4 h-4 text-[10px]  font-ppReg flex items-center justify-center rounded-full bg-green-100 text-white-100">
            1
          </div>
        </FlexColEnd>
      </FlexRowStartBtw>
    </button>
  );
}
