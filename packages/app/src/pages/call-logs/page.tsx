import {
  FlexColCenter,
  FlexColStart,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Info, Telescope } from "@/components/icons";
import SentimentAnalysisCard from "@/components/sentiment-analysis/card";
import TooltipComp from "@/components/TooltipComp";
import Button from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import animatedSvg from "@/data/animated-svg";
import { cn, formatNumber, maskPhoneNumber } from "@/lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const tableHeader = [
  {
    title: "Name",
  },
  {
    title: "Date/Time",
  },
  {
    title: "Caller Number",
  },
  {
    title: "Agent",
  },
  {
    title: "Action",
    align: "right",
  },
];

export default function CallLogsPage() {
  return (
    <FlexRowStart className="w-full gap-0">
      {/* call logs */}
      <FlexColStart className="w-full h-screen border-r-[.5px] border-r-white-400 bg-white-100 px-4 py-6 ">
        {/* header */}
        <FlexColStart className="w-full gap-1">
          <h1 className="font-ppB text-lg font-bold text-dark-100">
            Call Logs
          </h1>
          <p className="font-ppReg text-xs font-normal text-white-400/80">
            View all call logs and their details
          </p>
        </FlexColStart>

        <br />

        {/* call logs list */}
        <div className="w-full rounded-md border border-white-400/20 overflow-hidden">
          <Table>
            <TableHeader className="bg-white-300">
              <TableRow>
                {tableHeader.map((t, i) => (
                  <TableHead
                    className={cn(
                      "w-auto",
                      t.align === "right" && "text-right"
                    )}
                    key={i}
                  >
                    <h2
                      className={cn(
                        "text-[12px] font-jb font-bold text-dark-100",
                        i === 0 && "flex gap-2"
                      )}
                    >
                      {t.title}
                    </h2>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow key={1}>
                <TableCell className="">
                  <FlexRowStartCenter className="">
                    <img
                      src="https://api.dicebear.com/9.x/initials/svg?seed=unknown"
                      width={30}
                    />
                    <p className="font-ppM text-xs text-dark-100">Unknown</p>
                  </FlexRowStartCenter>
                </TableCell>

                <TableCell className="">
                  <FlexRowStartCenter className="w-full gap-1">
                    <p className="font-jb text-xs text-dark-100">
                      {dayjs(new Date()).format("DD MMM, YYYY")}
                    </p>
                    <p className="font-jb text-xs text-white-400">|</p>
                    <p className="font-jb font-bold text-xs text-dark-100">
                      {dayjs(new Date()).format("hh:mm A")}
                    </p>
                  </FlexRowStartCenter>
                </TableCell>

                <TableCell className="">
                  <FlexRowStartCenter className="w-full gap-1">
                    <p className="font-jb font-bold text-xs text-dark-100">
                      {maskPhoneNumber("+2347084701066")}
                    </p>
                  </FlexRowStartCenter>
                </TableCell>

                <TableCell className="">
                  <FlexRowStartCenter className="w-full gap-1">
                    <p className="font-jb font-bold text-xs text-dark-100 underline">
                      Baymax
                    </p>
                  </FlexRowStartCenter>
                </TableCell>

                <TableCell className="text-right">
                  <FlexRowEnd className="w-full gap-1">
                    <TooltipComp text="View details">
                      <button className="w-[40px] h-[35px] px-2 py-1 scale-[.85] rounded-sm bg-dark-100 text-white-100 font-ppReg text-xs active:scale-[.90] transition-all">
                        <Telescope size={20} />
                      </button>
                    </TooltipComp>
                  </FlexRowEnd>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableCaption className="pb-3">
              <p className="font-ppReg text-xs text-white-400">
                No call logs available
              </p>
            </TableCaption>
          </Table>
        </div>
      </FlexColStart>

      {/* call log info */}
      <FlexColStart className="w-full h-screen overflow-auto max-w-[350px] bg-white-200/20 py-5">
        {/* header */}
        <FlexColCenter className="w-full px-3">
          {true ? (
            <FlexColCenter className="w-full h-full relative">
              <SentimentAnalysisCard
                title="Malicious Call"
                analysis={[
                  {
                    sentiment: "negative",
                    confidence_level: 70,
                  },
                  {
                    sentiment: "neutral",
                    confidence_level: 10,
                  },
                  {
                    sentiment: "positive",
                    confidence_level: 20,
                  },
                ]}
                suggested_action="The caller seems to have a cunny response."
              />
              {/* overlay */}
              <FlexColCenter className="w-full h-full absolute z-[3] bg-white-100/30 backdrop-blur-sm">
                <Button
                  intent={"dark"}
                  className="w-[160px] h-[40px] scale-[.85] font-ppM text-white-100 text-[10px]"
                  enableBounceEffect
                >
                  View Sentiment Analysis
                </Button>
              </FlexColCenter>
            </FlexColCenter>
          ) : (
            <SentimentAnalysisCard
              title="Malicious Call"
              analysis={[
                {
                  sentiment: "negative",
                  confidence_level: 70,
                },
                {
                  sentiment: "neutral",
                  confidence_level: 10,
                },
                {
                  sentiment: "positive",
                  confidence_level: 20,
                },
              ]}
              suggested_action="The caller seems to have a cunny response."
            />
          )}
        </FlexColCenter>

        {/* call info */}
        <FlexColStart className="w-full mt-3 border-t-[.5px] border-t-white-400/50 py-6 px-3">
          <FlexRowStartBtw className="w-full">
            <p className="text-dark-100 font-ppM text-sm">Call Breakdown</p>

            <TooltipComp text="Some responses might be a little bit off.">
              <Info size={15} color="#000" />
            </TooltipComp>
          </FlexRowStartBtw>
          <p className="text-white-400 font-ppReg text-xs mb-2">
            Below is further information regarding the caller's motives and
            analysis.
          </p>
          <FlexColStart className="gap-4">
            <CallBreakdownContent
              label="Reason for the call?"
              content="The caller want to invite John for a meeting."
            />
            <CallBreakdownContent
              label="Was the caller's name provided?"
              content="Mark"
            />
            <CallBreakdownContent
              label="How did they obtain your phone number??"
              content="N/A"
            />
          </FlexColStart>
        </FlexColStart>

        {/* caller details */}
        <FlexColStart className="w-full mt-3 border-t-[.5px] border-t-white-400/50 pt-5 pb-0 px-3">
          <p className="text-dark-100 font-ppM text-sm mb-2">Caller Details</p>
          <CallerDetails leftValue="Country" rightValue={"United State"} />
          <CallerDetails leftValue="City" rightValue={"Alabama"} />
          <CallerDetails leftValue="Zipcode" rightValue={"19002"} />
          <CallerDetails
            leftValue="Time"
            rightValue={dayjs(new Date()).format("DD MMM,YYYY hh:mm A")}
          />
          <CallerDetails
            leftValue="Phone number"
            rightValue={formatNumber("+12345678899")!}
          />
        </FlexColStart>

        {/* conversation */}
        <FlexColStart className="w-full mt-3 border-t-[.5px] border-t-white-400/50 py-6 px-3">
          {/* <p className="text-dark-400/80 font-ppM text-sm mb-2">
            Conversations
          </p> */}
          <Button
            intent={"dark"}
            className="w-full h-[40px] scale-[.55] font-ppM text-white-100 text-xs -translate-y-3"
            enableBounceEffect
            leftIcon={<Telescope size={20} />}
          >
            View Conversation
          </Button>
        </FlexColStart>

        {/* call entry settings */}
        <FlexColStart className="w-full mt-3 border-t-[.5px] border-t-white-400/50 py-6 px-3">
          <Button
            intent={"error"}
            className="w-full h-[40px] scale-[.85] font-ppM text-white-100 text-xs bg-red-305 hover:bg-red-200 active:bg-red-305/30"
            enableBounceEffect
          >
            Add to blacklist
          </Button>
        </FlexColStart>

        {/* if no call log is selected */}
        {false && (
          <FlexColCenter className="w-full h-full">
            <img
              src={animatedSvg.find((d) => d.name === "scroll-txt")?.url}
              width={50}
              style={{
                filter:
                  "invert(0%) sepia(0%) saturate(7500%) hue-rotate(76deg) brightness(89%) contrast(104%)",
              }}
            />
            <p className="text-sm font-bold font-ppReg text-white-400">
              Select a call log to view details
            </p>
          </FlexColCenter>
        )}
      </FlexColStart>
    </FlexRowStart>
  );
}

interface CallerDetailsProps {
  leftValue: string;
  rightValue: string;
}

function CallerDetails({ leftValue, rightValue }: CallerDetailsProps) {
  return (
    <div className="w-full grid grid-cols-2">
      <FlexRowStart className="w-full">
        <p className="text-white-400 font-jb font-normal text-[12px]">
          {leftValue}
        </p>
      </FlexRowStart>
      <FlexRowStart className="w-full">
        <p className="text-dark-100 font-jb font-bold text-xs">{rightValue}</p>
      </FlexRowStart>
    </div>
  );
}

interface CallBreakdownContentProps {
  label: string;
  content: string;
}

function CallBreakdownContent({ label, content }: CallBreakdownContentProps) {
  return (
    <FlexColStart className="w-full h-auto gap-1">
      <label className="text-xs text-white-400 font-ppM rounded-t-[5px]">
        {label ?? ""}
      </label>
      <p className="w-full text-dark-100 font-ppM text-xs px-3 py-2 relative rounded-md border-[.5px] border-white-400/50 bg-white-300 ">
        {content ?? "N/A"}
      </p>
    </FlexColStart>
  );
}
