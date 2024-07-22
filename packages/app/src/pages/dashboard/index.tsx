import CircularProgressBar from "@/components/CircularProgressBar";
import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import {
  Bot,
  Brain,
  FileText,
  Library,
  MessagesSquare,
  PhoneCall,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "@/components/icons";
import { Spinner } from "@/components/Spinner";
import useSession from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function Dashboard() {
  const { user, loading } = useSession();
  const getTimeOfDay = () => {
    const now = dayjs();
    const hour = now.hour();
    if (hour >= 5 && hour < 12) {
      return "Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Afternoon";
    } else {
      return "Evening";
    }
  };

  return (
    <FlexColStart className="w-full h-screen relative bg-white-300">
      <FlexColStart className="w-full h-screen md:w-full xl:max-w-[90%] mx-auto">
        {/* header */}
        <FlexColStart className="w-full h-auto px-4 lg:px-8 py-7">
          <FlexColStart className="w-full gap-0 mb-4 mt-3">
            {/* <p className="text-md font-ppM text-white-400">Overview</p> */}
            <h1 className="text-[25px] font-ppSB text-dark-100">
              Good {getTimeOfDay()},{" "}
              <span className="text-brown-100">
                {!loading && user?.full_name}
              </span>
            </h1>
            <p className="text-sm font-ppReg text-white-400">
              An overview of your account.
            </p>
          </FlexColStart>

          {/* dashboard cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="w-full h-auto flex flex-wrap gap-4 col-span-1 lg:col-span-2">
              {/* metrics section */}
              <MetricCards
                type="customers"
                title="Total Customers"
                figure={500}
                growth={{
                  total: 500,
                  rate: { type: "decrease", percentage: 10 },
                }}
                description="From last weeks"
                loading={false}
              />

              <MetricCards
                type="agent"
                title="Total Agents"
                figure={500}
                description="Total agents created."
                loading={false}
              />

              <MetricCards
                type="messages"
                title="Total Agent Messages"
                messages={{
                  total: 500,
                  ai_chatbot_messages: 300,
                  ai_call_logs_messages: 200,
                }}
                description="Total messages sent by agents."
                loading={false}
              />

              <MetricCards
                type="knowledgebase"
                title="Total Knowledge Base"
                figure={500}
                description="Total knowledge base created."
                kb={{
                  pdf: 300,
                  web_pages: 200,
                }}
                loading={false}
              />
            </div>
            <div className="w-full h-auto">
              <SentimentCard />
            </div>
          </div>
        </FlexColStart>
      </FlexColStart>
    </FlexColStart>
  );
}

type MetricCardType =
  | "agent"
  | "conversation"
  | "call-logs"
  | "messages"
  | "customers"
  | "knowledgebase";
type StatsType = "increase" | "decrease" | "no-change";

interface MetricsCardProps {
  type: MetricCardType;
  title: string;
  description?: string;
  figure?: number;
  loading?: boolean;
  growth?: {
    total: number;
    rate: {
      type: StatsType;
      percentage: number;
    };
  };
  messages?: {
    total: number;
    ai_chatbot_messages: number;
    ai_call_logs_messages: number;
  };
  kb?: {
    pdf: number;
    web_pages: number;
  };
}

function MetricCards({
  type,
  title,
  figure,
  growth,
  description,
  messages,
  kb,
  loading,
}: MetricsCardProps) {
  const renderIcon = () => {
    switch (type) {
      case "agent":
        return (
          <Brain size={20} strokeWidth={2.4} className="stroke-dark-100" />
        );
      case "messages":
        return (
          <MessagesSquare
            size={20}
            strokeWidth={2.4}
            className="stroke-dark-100"
          />
        );

      case "knowledgebase":
        return (
          <Library size={20} strokeWidth={2.4} className="stroke-dark-100" />
        );

      case "customers":
        return (
          <UsersRound size={20} strokeWidth={2.4} className="stroke-dark-100" />
        );
    }
  };

  if (loading) {
    return (
      <FlexColStart className="w-full max-w-[350px] min-w-[300px] h-auto bg-white-100 rounded-2xl p-5">
        <FlexRowStartBtw className="w-full">
          <FlexColStart className="w-full">
            <FlexRowStartCenter className="w-auto">
              <div className="w-[40px] h-[40px] bg-white-300/50 rounded-xl flex-center">
                {renderIcon()}
              </div>
              <h1 className="text-md font-ppM text-dark-100">{title}</h1>
            </FlexRowStartCenter>
          </FlexColStart>
        </FlexRowStartBtw>
        <FlexColCenter className="w-full h-full">
          <Spinner color="#000" size={20} />
        </FlexColCenter>
      </FlexColStart>
    );
  }

  return (
    <FlexColStart className="w-full max-w-[350px] min-w-[300px] h-auto bg-white-100 rounded-2xl p-5">
      <FlexRowStartBtw className="w-full">
        <FlexColStart className="w-full">
          <FlexRowStartCenter className="w-auto">
            <div className="w-[40px] h-[40px] bg-white-300/50 rounded-xl flex-center">
              {renderIcon()}
            </div>
            <h1 className="text-md font-ppM text-dark-100">{title}</h1>
          </FlexRowStartCenter>

          <FlexRowStartCenter className="w-auto mt-2">
            <h1 className="text-3xl font-ppM font-extrabold">
              {figure ?? messages?.total}
            </h1>
            {growth && (
              <StatsBadge
                type={growth?.rate?.type}
                percentage={growth?.rate?.percentage}
              />
            )}
          </FlexRowStartCenter>

          {description && (
            <span className="text-xs font-ppReg text-white-400">
              {description}
            </span>
          )}

          {messages && (
            <FlexRowStartBtw className="w-full h-auto gap-5">
              {/* ai chatbot messages */}
              <FlexRowStartCenter className="w-auto h-auto">
                <Bot size={15} className="stroke-white-400" />
                <span className="text-xs font-jb font-medium text-dark-100">
                  Chatbot
                </span>
                <span className="text-xs text-white-400/40">|</span>
                <span className="text-xs font-jb text-white-400">
                  {messages.ai_chatbot_messages}
                </span>
              </FlexRowStartCenter>

              {/* ai call logs messages */}
              <FlexRowStartCenter className="w-auto h-auto">
                <PhoneCall size={15} className="stroke-white-400" />
                <span className="text-xs font-jb font-medium text-dark-100">
                  Voice Calls
                </span>
                <span className="text-xs text-white-400/40">|</span>
                <span className="text-xs font-jb text-white-400">
                  {messages.ai_call_logs_messages}
                </span>
              </FlexRowStartCenter>
            </FlexRowStartBtw>
          )}

          {/* knowledgebase section */}
          {kb && (
            <FlexRowStartBtw className="w-full h-auto gap-5">
              {/* pdf */}
              <FlexRowStartCenter className="w-auto h-auto gap-1">
                <FileText size={15} className="stroke-white-400" />
                <span className="text-xs font-jb font-medium text-dark-100">
                  PDF
                </span>
                <span className="text-xs text-white-400/40">|</span>
                <span className="text-xs font-jb text-white-400">
                  {kb?.pdf}
                </span>
              </FlexRowStartCenter>

              <FlexRowStartCenter className="w-auto h-auto gap-1">
                <FileText size={15} className="stroke-white-400" />
                <span className="text-xs font-jb font-medium text-dark-100">
                  Web Pages
                </span>
                <span className="text-xs text-white-400/40">|</span>
                <span className="text-xs font-jb text-white-400">
                  {kb?.web_pages}
                </span>
              </FlexRowStartCenter>
            </FlexRowStartBtw>
          )}
        </FlexColStart>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}

interface StatsBadgeProps {
  type: StatsType;
  percentage: number;
}

function StatsBadge({ type, percentage }: StatsBadgeProps) {
  const renderIcon = () => {
    switch (type) {
      case "increase":
        return (
          <TrendingUp
            size={12}
            strokeWidth={2.4}
            className="stroke-green-100"
          />
        );
      case "decrease":
        return (
          <TrendingDown
            size={12}
            strokeWidth={2.4}
            className="stroke-red-305"
          />
        );
    }
  };

  if (type === "no-change") return null;

  return (
    <FlexRowStartCenter
      className={cn(
        "w-auto px-2 py-1 rounded-full gap-1",

        type === "increase"
          ? "bg-green-100/20 text-green-100"
          : "bg-red-305/20 text-red-305"
      )}
    >
      {renderIcon()}
      <h1
        className={cn(
          "text-xs font-ppM",
          type === "increase" ? "text-green-100" : "text-red-305"
        )}
      >
        {percentage}%
      </h1>
    </FlexRowStartCenter>
  );
}

interface SentimentCardProps {}

type SentimentAnalysis = {
  conversations: {
    percentages: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  "call-logs": {
    percentages: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
};

function SentimentCard() {
  const [activeTab, setActiveTab] =
    useState<keyof SentimentAnalysis>("conversations");
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<SentimentAnalysis>({
    conversations: {
      percentages: {
        positive: 50,
        neutral: 30,
        negative: 20,
      },
    },
    "call-logs": {
      percentages: {
        positive: 10,
        neutral: 80,
        negative: 20,
      },
    },
  });
  const [highestSentiment, setHighestSentiment] = useState<
    { [key: string]: number } | undefined
  >(undefined);
  const [progressBarValue, setProgressBarValue] = useState(0);

  useEffect(() => {
    const currentPercentages = analysis[activeTab]?.percentages || {};
    const highest = Object.entries(currentPercentages).reduce(
      (max, [key, value]) => {
        if (value > (max.value || 0)) {
          return { key, value };
        }
        return max;
      },
      { key: "", value: 0 }
    );

    setHighestSentiment(
      highest.key ? { [highest.key]: highest.value } : undefined
    );
  }, [activeTab, analysis]);

  useEffect(() => {
    if (highestSentiment) {
      setTimeout(() => {
        setProgressBarValue(Object.values(highestSentiment)[0] || 0);
      }, 300);
    }
  }, [highestSentiment]);

  const tabs = [
    { name: "conversations", title: "Conversations" },
    { name: "call-logs", title: "Call Logs" },
  ];

  const indicators = [
    { label: "Positive", colorClass: "bg-green-100" },
    { label: "Neutral", colorClass: "bg-orange-100" },
    { label: "Negative", colorClass: "bg-red-305" },
  ];

  const sentimentColor = highestSentiment
    ? {
        positive: "#22C55E",
        neutral: "#f99d52",
        negative: "#ff4741",
      }[Object.keys(highestSentiment)[0]]
    : "";

  const sentimentText = highestSentiment
    ? `${Object.keys(highestSentiment)[0]} (${progressBarValue}%)`
    : "Analysis";

  return (
    <FlexColStart className="w-full h-auto bg-white-100 rounded-md p-6">
      {/* Header */}
      <FlexColStart className="w-full gap-1 pb-5">
        <h1 className="text-md text-dark-100 font-ppM font-extrabold">
          Sentiment Analysis
        </h1>
        {/* Tabs */}
        <FlexRowStart className="w-full mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={cn(
                "w-auto px-3 py-2 rounded-full text-xs font-ppReg enableBounceEffect",
                activeTab === tab.name
                  ? "bg-white-300 text-dark-100 border-[.5px] border-white-400/30 font-ppM"
                  : "bg-transparent text-white-400"
              )}
              onClick={() => setActiveTab(tab.name as keyof SentimentAnalysis)}
            >
              {tab.title}
            </button>
          ))}
        </FlexRowStart>
      </FlexColStart>

      {/* Circular Progress Bar */}
      <CircularProgressBar
        percentages={[
          {
            color: sentimentColor!,
            value: progressBarValue,
          },
        ]}
        size={200}
        strokeWidth={20}
        text={sentimentText}
      />

      {/* Indicator */}
      <FlexRowCenterBtw className="w-full mt-2">
        {indicators.map((indicator, index) => (
          <FlexRowStartCenter key={indicator.label}>
            <div
              className={cn(
                "w-[30px] h-[18px] rounded-sm",
                indicator.colorClass
              )}
            ></div>
            <span className="text-xs font-ppReg text-white-400">
              {indicator.label}
            </span>
          </FlexRowStartCenter>
        ))}
      </FlexRowCenterBtw>
    </FlexColStart>
  );
}

function useCount(value: number, time?: number, delay?: number) {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    setTimeout(() => {
      const interval = setInterval(() => {
        if (count >= value || count === value || value === 0) {
          clearInterval(interval);
          return value;
        }
        setCount((prev) => {
          if (prev >= value) {
            clearInterval(interval);
            return value;
          }
          return prev + 1;
        });
      }, time ?? 0);
      return () => clearInterval(interval);
    }, delay ?? 300);
  }, [count]);
  return count;
}
