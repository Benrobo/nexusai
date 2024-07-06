import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Glass, Info, Telescope } from "@/components/icons";
import SentimentAnalysisCard from "@/components/sentiment-analysis/card";
import { Spinner } from "@/components/Spinner";
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
import { useDataContext } from "@/context/DataContext";
import animatedSvg from "@/data/animated-svg";
import {
  getCallLogAnalysis,
  getCallLogs,
  markLogAsRead,
} from "@/http/requests";
import {
  cn,
  formatNumber,
  getCountryByCode,
  maskPhoneNumber,
} from "@/lib/utils";
import type { ResponseData } from "@/types";
import type { CallLogsResponseData } from "@/types/call-log.type";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);

const tableHeader = [
  {
    title: "Caller Name",
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

type PaginationState = {
  limit: number;
  page: number;
};

export default function CallLogsPage() {
  const { unreadLogs, refetchUnreadlogs } = useDataContext();
  const [pageLoading, setPageLoading] = useState(true);
  const [callLogs, setCallLogs] = useState<CallLogsResponseData[]>([]);
  const [selectedCallLog, setSelectedCallLog] =
    useState<CallLogsResponseData | null>(null);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [pagination, setPagination] = useState<PaginationState>({
    limit: 8,
    page: 1,
  });
  const getCallLogMut = useMutation({
    mutationFn: async (data: PaginationState) =>
      await getCallLogs(data.page, data.limit),
    onSuccess: (data: any) => {
      const resp = data as ResponseData;
      setCallLogs(resp.data["logs"]);
      setTotalLogs(resp.data["meta"]["total"]);
      setPageLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
      setPageLoading(false);
    },
  });
  const markLogAsReadMut = useMutation({
    mutationFn: async (id: string) => await markLogAsRead(id),
    onSuccess: () => {
      refetchUnreadlogs();
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      console.log("Failed to mark log as read: ", err);
      refetchUnreadlogs();
    },
  });
  const getCallLogAnalysisMut = useMutation({
    mutationFn: async (id: string) => await getCallLogAnalysis(id),
    onSuccess: (data: any) => {
      const resp = data as ResponseData;
      const _data = resp.data;
      let foundLog = callLogs.find((l) => l.id === selectedCallLog?.id);
      const selectedLogIdx = callLogs.findIndex(
        (l) => l.id === selectedCallLog?.id
      );
      if (foundLog) {
        foundLog.analysis = {
          ..._data,
          red_flags: Array.isArray(_data?.red_flags)
            ? _data?.red_flags.join(", ")
            : _data?.red_flags,
        };
        callLogs.splice(selectedLogIdx, 1, foundLog);
        setCallLogs(callLogs);
      }
      getCallLogAnalysisMut.reset();
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      console.log("Failed to mark log as read: ", err);
      toast.error(err?.message ?? "Failed retrieving analysis.");
    },
  });

  useEffect(() => {
    getCallLogMut.mutate(pagination);
    setPageLoading(true);
    setSelectedCallLog(null);
  }, [pagination]);

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
            {callLogs?.length > 0 &&
              (!getCallLogMut.isPending || !pageLoading) && (
                <TableBody>
                  {callLogs.map((log, i) => (
                    <TableRow
                      key={i}
                      className={cn(
                        "relative hover:bg-white-300",
                        selectedCallLog?.id === log.id && "bg-white-300"
                      )}
                    >
                      <TableCell className="relative">
                        <FlexRowStartCenter className="relative">
                          <img
                            src={`https://api.dicebear.com/9.x/initials/svg?seed=${log?.logEntry?.callerName ?? "unknown"}`}
                            width={30}
                          />
                          <p className="font-ppM text-xs text-dark-100">
                            {log?.logEntry?.callerName ?? "Unknown"}
                          </p>
                          {unreadLogs.includes(log.id) && (
                            <span className="w-[10px] h-[10px] absolute top-0 left-0 translate-x-8 -translate-y-3 bg-red-305 text-[10px] font-ppM flex items-center justify-center rounded-full text-white-100 scale-[.95]"></span>
                          )}
                        </FlexRowStartCenter>
                      </TableCell>

                      <TableCell className="">
                        <FlexRowStartCenter className="w-full gap-1">
                          <p className="font-jb text-xs text-dark-100">
                            {dayjs(log.created_at).format("DD MMM, YYYY")}
                          </p>
                          <p className="font-jb text-xs text-white-400">|</p>
                          <p className="font-jb font-bold text-xs text-dark-100">
                            {dayjs(log.created_at).format("hh:mm A")}
                          </p>
                        </FlexRowStartCenter>
                      </TableCell>

                      <TableCell className="">
                        <FlexRowStartCenter className="w-full gap-1">
                          <p className="font-jb font-bold text-xs text-dark-100">
                            {maskPhoneNumber(log?.from_number)}
                          </p>
                        </FlexRowStartCenter>
                      </TableCell>

                      <TableCell className="">
                        <FlexRowStartCenter className="w-full gap-1">
                          <Link
                            to={`/agents/${log?.agent.id}?tab=settings`}
                            className="font-jb font-bold text-xs text-dark-100 underline"
                          >
                            {log?.agent?.name ?? "N/A"}
                          </Link>
                        </FlexRowStartCenter>
                      </TableCell>

                      <TableCell className="text-right">
                        <FlexRowEnd className="w-full gap-1">
                          <TooltipComp text="View details">
                            <button
                              className="w-[40px] h-[35px] px-2 py-1 scale-[.85] rounded-sm bg-dark-100 text-white-100 font-ppReg text-xs active:scale-[.90] transition-all"
                              onClick={() => {
                                setSelectedCallLog(null);
                                setTimeout(() => {
                                  setSelectedCallLog(log);
                                }, 100);
                                markLogAsReadMut.mutate(log.id);
                              }}
                            >
                              <Telescope size={20} />
                            </button>
                          </TooltipComp>
                        </FlexRowEnd>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}

            {callLogs.length === 0 && !pageLoading ? (
              <TableCaption className="pb-3">
                <p className="font-ppReg text-xs text-white-400">
                  No call logs available
                </p>
              </TableCaption>
            ) : pageLoading ? (
              <TableCaption className="pb-3">
                <Spinner color="#000" size={15} />
              </TableCaption>
            ) : null}
            {callLogs.length > 0 && (
              <TableCaption className="pb-3">
                <p className="font-ppReg text-xs text-white-400">
                  Page{" "}
                  <span className="text-dark-100 font-ppB">
                    {pagination.page}
                  </span>{" "}
                  of {""}
                  <span className="text-dark-100 font-ppB">
                    {/* total pages left */}
                    {Math.ceil(totalLogs / pagination.limit)}
                  </span>{" "}
                  {/* call logs */}
                </p>
                <FlexRowCenter className="w-auto mt-1">
                  <button
                    className="w-[45px] h-[30px] bg-dark-100 text-white-100 font-ppReg text-xs rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                  >
                    Prev
                  </button>
                  <button
                    className="w-[45px] h-[30px] bg-dark-100 text-white-100 font-ppReg text-xs rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={
                      pagination.page === callLogs.length ||
                      callLogs.length < pagination.limit ||
                      pagination.page ===
                        Math.ceil(totalLogs / pagination.limit)
                    }
                  >
                    Next
                  </button>
                </FlexRowCenter>
              </TableCaption>
            )}
          </Table>
        </div>
      </FlexColStart>

      {/* call log info */}
      <FlexColStart className="w-full h-screen overflow-auto max-w-[350px] bg-white-200/20 py-5">
        {selectedCallLog && (
          <>
            {/* header */}
            <FlexColCenter className="w-full px-3">
              {!selectedCallLog?.analysis ? (
                <FlexColCenter className="w-full h-full relative">
                  <SentimentAnalysisCard
                    analysis={{
                      sentiment: "Malicious Call",
                      confidence: 70,
                      suggested_action:
                        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. ",
                      type: "negative",
                      red_flags: "No red flags",
                    }}
                  />
                  {/* overlay */}
                  <FlexColCenter className="w-full h-full absolute z-[3] bg-white-100/30 backdrop-blur-sm">
                    <Button
                      intent={"dark"}
                      className="w-[160px] h-[40px] scale-[.85] font-ppM text-white-100 text-[12px]"
                      enableBounceEffect
                      isLoading={getCallLogAnalysisMut.isPending}
                      disabled={getCallLogAnalysisMut.isPending}
                      onClick={() => {
                        getCallLogAnalysisMut.mutate(selectedCallLog.id);
                      }}
                    >
                      {/* View Sentiment Analysis */}
                      <FlexRowCenter>
                        <Glass size={20} />
                        View Analysis
                      </FlexRowCenter>
                    </Button>
                  </FlexColCenter>
                </FlexColCenter>
              ) : (
                <SentimentAnalysisCard
                  agent_type={selectedCallLog.agent.type}
                  analysis={selectedCallLog?.analysis}
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
              {selectedCallLog.agent.type === "ANTI_THEFT" && (
                <FlexColStart className="gap-4">
                  <CallBreakdownContent
                    label="Reason for the call?"
                    content={selectedCallLog?.logEntry?.callReason ?? "N/A"}
                  />
                  <CallBreakdownContent
                    label="Was the caller's name provided?"
                    content={selectedCallLog?.logEntry?.callerName ?? "N/A"}
                  />
                  <CallBreakdownContent
                    label="How did they obtain your phone number??"
                    content={selectedCallLog?.logEntry?.referral ?? "N/A"}
                  />
                </FlexColStart>
              )}
            </FlexColStart>

            {/* caller details */}

            <FlexColStart className="w-full mt-3 border-t-[.5px] border-t-white-400/50 pt-5 pb-0 px-3">
              <p className="text-dark-100 font-ppM text-sm mb-2">
                Caller Details
              </p>
              <CallerDetails
                leftValue="Country"
                rightValue={
                  `${getCountryByCode(selectedCallLog?.caller_country!)?.name + " " + getCountryByCode(selectedCallLog?.caller_country!)?.emoji} ` ??
                  "N/A"
                }
              />
              <CallerDetails
                leftValue="City"
                rightValue={selectedCallLog?.caller_city ?? "N/A"}
              />
              <CallerDetails
                leftValue="Zipcode"
                rightValue={selectedCallLog?.zip_code ?? "N/A"}
              />
              <CallerDetails
                leftValue="Time"
                rightValue={dayjs(selectedCallLog?.created_at).format(
                  "DD MMM,YYYY hh:mm A"
                )}
              />
              <CallerDetails
                leftValue="Phone number"
                rightValue={formatNumber(selectedCallLog?.from_number)!}
              />
            </FlexColStart>

            {/* conversation */}
            <FlexColStart className="w-full mt-3 border-t-[.5px] border-t-white-400/50 px-3">
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
          </>
        )}

        {/* if no call log is selected */}
        {!selectedCallLog && (
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
