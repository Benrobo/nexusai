import { FlexRowCenter, FlexRowStart } from "../Flex";

export type Sentiment = "positive" | "negative" | "neutral";

export type SentimentData = {
  sentiment: Sentiment;
  confidence_level: number;
};

interface SentimentChartProps {
  data: {
    sentiment: Sentiment;
    confidence_level: number;
  }[];
}

export default function SentimentChart({ data }: SentimentChartProps) {
  const getPipeStyle = (sentiment: Sentiment) => {
    return {
      height: "20px",
      width:
        data.find((s) => s.sentiment === sentiment)?.confidence_level + "%",
    };
  };

  return (
    <FlexRowStart className="w-full gap-0 p-0 rounded-full overflow-hidden">
      {/* pipe */}
      <FlexRowCenter
        className="bg-red-305 z-[1]"
        style={getPipeStyle("negative")}
      >
        <span className="text-[10px] text-white-100 font-ppM">
          {data.find((s) => s.sentiment === "negative")?.confidence_level + "%"}
        </span>
      </FlexRowCenter>
      <FlexRowCenter
        className="bg-orange-300 z-[1]"
        style={getPipeStyle("neutral")}
      >
        <span className="text-[10px] text-white-100 font-ppM">
          {data.find((s) => s.sentiment === "neutral")?.confidence_level + "%"}
        </span>
      </FlexRowCenter>
      <FlexRowCenter
        className="bg-green-500 z-[1]"
        style={getPipeStyle("positive")}
      >
        <span className="text-[10px] text-white-100 font-ppM">
          {data.find((s) => s.sentiment === "positive")?.confidence_level + "%"}
        </span>
      </FlexRowCenter>
    </FlexRowStart>
  );
}
