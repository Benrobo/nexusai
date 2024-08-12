import {
  FlexColCenter,
  FlexColStart,
  FlexColStartBtw,
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
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMutation } from "@tanstack/react-query";
import {
  getCallLogSentimentAnalysis,
  getConversationSentimentAnalysis,
  getCustomerGrowthStats,
  getTotalAgents,
  getTotalAIMessagesMetrics,
  getTotalKnowledgeBase,
} from "@/http/requests";
import toast from "react-hot-toast";
import type { AgentType, KBType, ResponseData } from "@/types";
import TooltipComp from "@/components/TooltipComp";
import { agentTypes } from "@/data/agent";
import DonutChart from "@/components/DonutChart";

dayjs.extend(relativeTime);

interface DashboardMetricsData {
  customer_growth: {
    total: number;
    rate: {
      type: "increase" | "decrease" | "no-change";
      percentage: number;
    };
  };
  total_agents: {
    type: AgentType;
    total: number;
  }[];
  total_agent_messages: {
    total: number;
    ai_chatbot_messages: number;
    ai_call_logs_messages: number;
  };
  total_knowledge_base: {
    type: KBType;
    total: number;
  }[];
}

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
  const [metrics, setMetrics] = useState<DashboardMetricsData>({
    customer_growth: {
      total: 0,
      rate: { type: "no-change", percentage: 0 },
    },
    total_agents: [],
    total_agent_messages: {
      total: 0,
      ai_chatbot_messages: 0,
      ai_call_logs_messages: 0,
    },
    total_knowledge_base: [],
  });
  const getCustomerGrowthMut = useMutation({
    mutationFn: async () => await getCustomerGrowthStats(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setMetrics((prev) => ({
        ...prev,
        customer_growth: resp.data,
      }));
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const getTotalKBMut = useMutation({
    mutationFn: async () => await getTotalKnowledgeBase(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setMetrics((prev) => ({
        ...prev,
        total_knowledge_base: resp.data,
      }));
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const getTotalAIMsgMut = useMutation({
    mutationFn: async () => await getTotalAIMessagesMetrics(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      const total = resp?.data["totalMessagesCombMessages"];
      const ai_chatbot_messages = resp?.data["totalAIConversationsMessages"];
      const ai_call_logs_messages = resp?.data["totalAICallLogsMessages"];
      setMetrics((prev) => ({
        ...prev,
        total_agent_messages: {
          total,
          ai_chatbot_messages,
          ai_call_logs_messages,
        },
      }));
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const getTotalAgentsMut = useMutation({
    mutationFn: async () => await getTotalAgents(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setMetrics((prev) => ({
        ...prev,
        total_agents: resp.data,
      }));
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });

  useEffect(() => {
    getCustomerGrowthMut.mutate();
    getTotalAgentsMut.mutate();
    getTotalAIMsgMut.mutate();
    getTotalKBMut.mutate();
  }, []);

  return (
    <FlexColStart className="w-full h-screen relative bg-white-300">
      <FlexColStart className="w-full h-screen md:w-full xl:max-w-[95%] mx-auto">
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
                figure={metrics.customer_growth?.total}
                growth={metrics.customer_growth!}
                description="From last weeks"
                loading={getCustomerGrowthMut.isPending}
              />

              <MetricCards
                type="agent"
                title="Total Agents"
                figure={metrics.total_agents.length}
                agents={{
                  total:
                    metrics.total_agents.length > 0
                      ? metrics.total_agents
                          .map((a) => a.total)
                          .reduce((a, b) => a + b)
                      : 0,
                  data: metrics.total_agents,
                }}
                description="Total agents created."
                loading={getTotalAgentsMut.isPending}
              />

              <MetricCards
                type="messages"
                title="Total Agent Messages"
                messages={metrics.total_agent_messages}
                description="Total messages sent by agents."
                loading={getTotalAIMsgMut.isPending}
              />

              <MetricCards
                type="knowledgebase"
                title="Total Knowledge Base"
                figure={
                  metrics.total_knowledge_base?.length > 0
                    ? metrics.total_knowledge_base
                        .map((kb) => kb.total)
                        .reduce((a, b) => a + b)
                    : 0
                }
                description="Total knowledge base created."
                kb={metrics.total_knowledge_base}
                loading={getTotalKBMut.isPending}
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
  agents?: {
    total: number;
    data: {
      type: AgentType;
      total: number;
    }[];
  };
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
    type: KBType;
    total: number;
  }[];
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
  agents,
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
    <FlexColStart className="w-full max-w-[350px] min-w-[300px] h-auto bg-white-100 rounded-2xl p-5 relative">
      <FlexRowStartBtw className="w-full h-full">
        <FlexColStartBtw className="w-full h-full">
          <FlexRowStartCenter className="w-auto">
            <div className="w-[40px] h-[40px] bg-white-300/50 rounded-xl flex-center">
              {renderIcon()}
            </div>
            <h1 className="text-md font-ppM text-dark-100">{title}</h1>
          </FlexRowStartCenter>

          <FlexRowStartCenter className="w-auto mt-2">
            <h1 className="text-3xl font-ppM font-extrabold">
              {figure ? figure ?? 0 : messages?.total ?? 0}
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
                  {messages?.ai_chatbot_messages ?? 0}
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
                  {messages?.ai_call_logs_messages ?? 0}
                </span>
              </FlexRowStartCenter>
            </FlexRowStartBtw>
          )}

          {agents && (
            <FlexColCenter className="w-auto h-full absolute top-0 right-4">
              {agentTypes.map((t, idx) => (
                <FlexRowStartCenter key={idx} className="w-auto">
                  <TooltipComp
                    text={`${agents.data.find((a) => a.type === t.type)?.total ?? 0} ${t.title} agent.`}
                  >
                    <img
                      src={t.img}
                      width={25}
                      className="border-[.5px] border-white-400/30 rounded-full grayscale-[100%] hover:grayscale-0"
                    />
                  </TooltipComp>
                </FlexRowStartCenter>
              ))}
            </FlexColCenter>
          )}

          {/* knowledgebase section */}
          {kb && kb?.length > 0 && (
            <FlexRowStartBtw className="w-full h-auto gap-5">
              {/* pdf */}
              <FlexRowStartCenter className="w-auto h-auto gap-1">
                <FileText size={15} className="stroke-white-400" />
                <span className="text-xs font-jb font-medium text-dark-100">
                  PDF
                </span>
                <span className="text-xs text-white-400/40">|</span>
                <span className="text-xs font-jb text-white-400">
                  {kb?.find((k) => k.type === "PDF")?.total}
                </span>
              </FlexRowStartCenter>

              <FlexRowStartCenter className="w-auto h-auto gap-1">
                <FileText size={15} className="stroke-white-400" />
                <span className="text-xs font-jb font-medium text-dark-100">
                  Web Pages
                </span>
                <span className="text-xs text-white-400/40">|</span>
                <span className="text-xs font-jb text-white-400">
                  {kb?.find((k) => k.type === "WEB_PAGES")?.total}
                </span>
              </FlexRowStartCenter>
            </FlexRowStartBtw>
          )}
        </FlexColStartBtw>
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
        positive: 0,
        neutral: 0,
        negative: 0,
      },
    },
    "call-logs": {
      percentages: {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
    },
  });
  const [highestSentiment, setHighestSentiment] = useState<
    { [key: string]: number } | undefined
  >(undefined);
  const [progressBarValue, setProgressBarValue] = useState(0);
  const getCallLogSentimentAnalysisMut = useMutation({
    mutationFn: async () => await getCallLogSentimentAnalysis(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setAnalysis((prev) => ({
        ...prev,
        "call-logs": {
          percentages: {
            positive: Math.floor(resp.data.positive),
            neutral: Math.floor(resp.data.neutral),
            negative: Math.floor(resp.data.negative),
          },
        },
      }));
      setLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
    },
  });
  const getConversationsSentimentAnalysisMut = useMutation({
    mutationFn: async () => await getConversationSentimentAnalysis(),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      setAnalysis((prev) => ({
        ...prev,
        conversations: {
          percentages: {
            positive: Math.floor(resp.data.positive),
            neutral: Math.floor(resp.data.neutral),
            negative: Math.floor(resp.data.negative),
          },
        },
      }));
      setLoading(false);
    },
    onError: (error) => {
      const err = (error as any).response.data as ResponseData;
      toast.error(err.message);
      setLoading(false);
    },
  });

  useEffect(() => {
    if (
      getConversationsSentimentAnalysisMut.isPending ||
      getCallLogSentimentAnalysisMut.isPending
    )
      return;

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

  useEffect(() => {
    if (activeTab === "conversations") {
      getConversationsSentimentAnalysisMut.mutate();
      setLoading(true);
    } else {
      getCallLogSentimentAnalysisMut.mutate();
      setLoading(true);
    }
  }, [activeTab]);

  const tabs = [
    { name: "conversations", title: "Conversations" },
    { name: "call-logs", title: "Call Logs" },
  ];

  const indicators = [
    {
      label: "Positive",
      colorClass: "bg-green-100",
      percentage: analysis[activeTab]?.percentages?.positive || 0,
    },
    {
      label: "Neutral",
      colorClass: "bg-orange-100",
      percentage: analysis[activeTab]?.percentages?.neutral || 0,
    },
    {
      label: "Negative",
      colorClass: "bg-red-305",
      percentage: analysis[activeTab]?.percentages?.negative || 0,
    },
  ];

  const sentimentText = highestSentiment
    ? `${Object.keys(highestSentiment)[0]} (${progressBarValue}%)`
    : "No data available";

  console.log(analysis[activeTab]);

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

      <div className="w-full h-full flex-center">
        {loading ? (
          <DonutChart
            centeredChildren={
              <span className="text-sm font-ppM">{"Loading..."}</span>
            }
            segments={[
              {
                color: "#ebebebb6",
                value: 100,
                label: "Segment 1",
              },
              {
                color: "#ebebebb6",
                value: 100,
                label: "Segment 2",
              },
              {
                color: "#ebebebb6",
                value: 100,
                label: "Segment 3",
              },
            ]}
            size={200}
          />
        ) : (
          <DonutChart
            centeredChildren={
              <span className="text-sm font-ppM">
                {analysis[activeTab] && sentimentText}
              </span>
            }
            segments={
              analysis[activeTab]
                ? (() => {
                    const segments = [
                      {
                        color: "#22C55E",
                        value: analysis[activeTab].percentages.positive,
                        label: "Positive",
                      },
                      {
                        color: "#f99d52",
                        value: analysis[activeTab].percentages.neutral,
                        label: "Neutral",
                      },
                      {
                        color: "#ff4741",
                        value: analysis[activeTab].percentages.negative,
                        label: "Negative",
                      },
                    ];
                    const totalPercentage = segments.reduce(
                      (sum, segment) => sum + segment.value,
                      0
                    );
                    return totalPercentage === 0
                      ? [{ color: "#ebebebb6", value: 100, label: "No data" }]
                      : segments.filter((segment) => segment.value !== 0);
                  })()
                : [
                    {
                      color: "#ebebebb6",
                      value: 33.33,
                      label: "Seg-1",
                    },
                    {
                      color: "#ebebebb6",
                      value: 50,
                      label: "Seg-2",
                    },
                    {
                      color: "#ebebebb6",
                      value: 33.33,
                      label: "Seg-3",
                    },
                  ]
            }
            size={200}
          />
        )}
      </div>

      {/* Indicator */}
      <FlexRowCenterBtw className="w-full mt-2 gap-2">
        {indicators.map((indicator, index) => (
          <FlexRowStartCenter key={index} className="gap-2">
            <TooltipComp text={`${indicator.percentage}%`}>
              <div
                className={cn(
                  "w-[30px] h-[18px] rounded-sm",
                  indicator.colorClass
                )}
              ></div>
            </TooltipComp>
            <span className="text-xs font-ppReg text-white-400">
              {indicator.label}
            </span>
          </FlexRowStartCenter>
        ))}
      </FlexRowCenterBtw>
    </FlexColStart>
  );
}
