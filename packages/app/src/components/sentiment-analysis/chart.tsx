import { cn } from "@/lib/utils";
import { FlexRowCenter, FlexRowStart } from "../Flex";

export type Sentiment = "positive" | "negative" | "neutral";

export type SentimentData = {
  id?: string;
  sentiment: string;
  suggested_action: string;
  confidence: number;
  type: Sentiment;
  red_flags?: string | null;
};

interface SentimentChartProps {
  data: {
    id?: string;
    confidence: number;
    type: Sentiment;
  };
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const getPipeStyle = (type: Sentiment) => {
    const mainWidth = data?.confidence;
    const half = mainWidth / 2;

    if (data.type === type) {
      return {
        height: "15px",
        width: data?.confidence + "%",
      };
    } else {
      return {
        height: "15px",
        width: half + "%",
      };
    }
  };

  return (
    <FlexRowStart className="w-full gap-0 p-0 rounded-full overflow-hidden border-[.5px] border-white-400/50 bg-white-300">
      {/* pipe */}
      {/* <FlexRowCenter
        className="bg-red-305 z-[1]"
        style={getPipeStyle("negative")}
      >
        <span className="text-[10px] text-white-100 font-ppM">
          {getPipeStyle("negative")?.width}
        </span>
      </FlexRowCenter> */}
      <FlexRowCenter
        className={cn(
          "z-[1]",
          data.type === "positive"
            ? "bg-green-500"
            : data.type === "neutral"
              ? "bg-orange-100"
              : data.type === "negative"
                ? "bg-red-305"
                : ""
        )}
        style={getPipeStyle("neutral")}
      >
        <span className="text-[10px] text-white-100 font-ppM">
          {getPipeStyle("neutral")?.width}
        </span>
      </FlexRowCenter>
      {/* <FlexRowCenter
        className="bg-green-500 z-[1]"
        style={getPipeStyle("positive")}
      >
        <span className="text-[10px] text-white-100 font-ppM">
          {getPipeStyle("positive")?.width}
        </span>
      </FlexRowCenter> */}
    </FlexRowStart>
  );
}
