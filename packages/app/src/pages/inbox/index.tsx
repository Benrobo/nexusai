import {
  FlexColCenter,
  FlexColEnd,
  FlexColStart,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { ElipsisVertical, PersonStanding } from "@/components/icons";
import TooltipComp from "@/components/TooltipComp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSession from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
export default function Inbox() {
  const data = useSession();
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
      <FlexColStart className="w-full h-full bg-white-100">
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
        <FlexColStart className="w-full border-t-[.5px] border-t-white-400/30 px-4 py-4">
          <p className="text-dark-400 font-ppB text">User Details</p>
        </FlexColStart>
      </FlexColStart>
    </FlexRowStart>
  );
}

function DetailsCard() {
  return <FlexRowStartBtw className="w-full"></FlexRowStartBtw>;
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
