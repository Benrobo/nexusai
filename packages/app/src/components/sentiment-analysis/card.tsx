import { FlexColStart } from "../Flex";
import { cn } from "@/lib/utils";
import SentimentChart, { type SentimentData } from "./chart";
import { Meh, ShieldAlert, ThumbsUp } from "../icons";

interface SentimentAnalysisCardProps {
  title: string;
  suggested_action: string;
  analysis: SentimentData[];
}

export default function SentimentAnalysisCard({
  title,
  suggested_action,
  analysis,
}: SentimentAnalysisCardProps) {
  const highestValue = analysis?.reduce((max, current) => {
    return current?.confidence_level > max?.confidence_level ? current : max;
  });

  return (
    <FlexColStart className="w-full rounded-md bg-white-100 border-[.5px] border-white-400/30 px-4 py-3 relative overflow-hidden">
      <FlexColStart className="w-full gap-1">
        <p className="text-sm text-gray-100 font-ppM z-[1]">Call Sentiment</p>
        <h1
          className={cn(
            "text-md font-extrabold font-ppB z-[1]",
            highestValue?.sentiment === "positive"
              ? "text-green-100"
              : highestValue?.sentiment === "negative"
                ? "text-red-305"
                : highestValue?.sentiment === "neutral"
                  ? "text-orange-100"
                  : "text-dark-100"
          )}
        >
          {title ?? "No title"}
        </h1>
      </FlexColStart>
      <SentimentChart data={analysis} />

      {/* remarks and suggested action */}
      <FlexColStart className="w-full gap-1">
        <p className={cn("text-xs text-dark-100 font-normal font-ppReg z-[1]")}>
          {suggested_action}
        </p>
      </FlexColStart>

      {/* sentiment ID */}
      <div className="absolute top-2 right-2">
        {highestValue?.sentiment === "positive" && (
          <ThumbsUp
            size={60}
            className={cn("opacity-[.20] stroke-green-100")}
          />
        )}

        {highestValue?.sentiment === "negative" && (
          <ShieldAlert
            size={60}
            className={cn("opacity-[.20] stroke-red-305")}
          />
        )}

        {highestValue?.sentiment === "neutral" && (
          <Meh size={60} className={cn("opacity-[.20] stroke-orange-300")} />
        )}
      </div>
    </FlexColStart>
  );
}
