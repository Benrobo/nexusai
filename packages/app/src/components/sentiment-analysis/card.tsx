import { FlexColStart } from "../Flex";
import { cn } from "@/lib/utils";
import SentimentChart, { type SentimentData } from "./chart";
import animatedSvg from "@/data/animated-svg";
import type { AgentType } from "@/types";

interface SentimentAnalysisCardProps {
  analysis: SentimentData;
  agent_type: AgentType;
}

export default function SentimentAnalysisCard({
  analysis,
}: SentimentAnalysisCardProps) {
  const title = analysis?.sentiment;
  const suggested_action = analysis?.suggested_action;

  return (
    <FlexColStart className="w-full rounded-md bg-white-100 border-[.5px] border-white-400/30 px-4 py-3 relative overflow-hidden">
      <FlexColStart className="w-full gap-1">
        <p className="text-xs text-gray-100 font-ppM z-[1]">Call Sentiment</p>
        <h1
          className={cn(
            "text-md font-bold font-ppM z-[1]",
            analysis?.type === "positive"
              ? "text-green-100"
              : analysis?.type === "negative"
                ? "text-red-305"
                : analysis?.type === "neutral"
                  ? "text-orange-100"
                  : "text-dark-100"
          )}
        >
          {title.replace(/\\/g, "") ?? "No title"}
        </h1>
      </FlexColStart>
      <SentimentChart data={analysis} />

      {/* remarks and suggested action */}
      <FlexColStart className="w-full gap-1 mt-2">
        <p className={cn("text-xs text-dark-100 font-bold font-ppM z-[1]")}>
          Action
        </p>
        <p className={cn("text-xs text-dark-100 font-normal font-ppReg z-[1]")}>
          {suggested_action.replace(/\\/g, "")}
        </p>
      </FlexColStart>

      <FlexColStart className="w-full gap-1 mt-1">
        <p className={cn("text-xs text-dark-100 font-bold font-ppM z-[1]")}>
          Feedback / Actions 💬
        </p>
        <p className={cn("text-xs text-dark-100 font-normal font-ppReg z-[1]")}>
          {analysis?.red_flags?.split(",").join(", ").replace(/\\/g, "") ??
            "NONE"}
        </p>
      </FlexColStart>

      {/* sentiment ID */}
      <div className="absolute top-2 right-2">
        {analysis?.type === "positive" && (
          <img
            src={animatedSvg.find((d) => d.name === "thumbsup")?.url}
            width={60}
            className={cn("opacity-[.20] stroke-green-100")}
            style={{
              filter:
                "invert(42%) sepia(70%) saturate(471%) hue-rotate(81deg) brightness(86%) contrast(94%)", // green
            }}
          />
        )}

        {analysis?.type === "negative" && (
          <img
            src={animatedSvg.find((d) => d.name === "shield-alert")?.url}
            width={60}
            className={cn("opacity-[.20] stroke-red-305")}
            style={{
              filter:
                "invert(44%) sepia(76%) saturate(2801%) hue-rotate(334deg) brightness(99%) contrast(104%)", // red
            }}
          />
        )}

        {analysis?.type === "neutral" && (
          <img
            src={animatedSvg.find((d) => d.name === "meh")?.url}
            width={60}
            className={cn("opacity-[.20]")}
            style={{
              filter:
                "invert(61%) sepia(27%) saturate(949%) hue-rotate(343deg) brightness(106%) contrast(95%)", // orange
            }}
          />
        )}
      </div>
    </FlexColStart>
  );
}
