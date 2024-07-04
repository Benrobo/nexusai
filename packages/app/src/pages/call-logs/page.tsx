import {
  FlexColCenter,
  FlexColStart,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Telescope } from "@/components/icons";
import SentimentAnalysisCard from "@/components/sentiment-analysis/card";
import TooltipComp from "@/components/TooltipComp";
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
      <FlexColStart className="w-full h-screen max-w-[400px] bg-white-200/20 py-5 px-3">
        {/* header */}
        <FlexColCenter className="w-full">
          <SentimentAnalysisCard
            title="Malicious Call"
            analysis={[
              {
                sentiment: "negative",
                confidence_level: 20,
              },
              {
                sentiment: "neutral",
                confidence_level: 10,
              },
              {
                sentiment: "positive",
                confidence_level: 70,
              },
            ]}
            suggested_action="The caller seems to have a cunny response."
          />
        </FlexColCenter>

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
