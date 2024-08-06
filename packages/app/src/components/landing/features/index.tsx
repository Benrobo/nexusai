import {
  FlexColCenter,
  FlexColStart,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Boxes } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

const features = [
  {
    name: "dashboard-analytics",
    title: "Real-Time Insights and Performance Tracking",
    description:
      "Unlock data-driven decision making with our advanced dashboard analytics. Visualize key performance indicators, monitor trends, and optimize your operations for maximum efficiency.",
    video: "https://trynexusai.imgix.net/assets/videos/dashboard-prev.mp4",
  },
  {
    name: "add-knowledge-base",
    title: "Comprehensive Knowledge Base Integration",
    description:
      "Empower your customer support with a dynamic, easily updatable knowledge base. Ensure consistent, accurate responses to customer inquiries, even outside of business hours.",
    video: "https://trynexusai.imgix.net/assets/videos/add-kb-prev.mp4",
  },
  {
    name: "add-integration",
    title: "Seamless Third-Party Integrations",
    description:
      "Streamline your operations by integrating with a wide range of industry-leading tools and services. Our flexible API enables custom connections, creating a cohesive ecosystem tailored to your business needs.",
    video: "https://trynexusai.imgix.net/assets/videos/add-int-prev.mp4",
  },
  {
    name: "telegram-integration",
    title: "Enhanced Customer Engagement with Telegram",
    description:
      "Expand your customer engagement channels with Telegram integration. Provide a seamless experience for your customers to interact with your business through Telegram.",
    video: "https://trynexusai.imgix.net/assets/videos/tg-int.mp4",
  },
  {
    name: "monitor-call-logs",
    title: "Advanced Call Log Analysis and Insights",
    description:
      "Gain valuable insights from agent-customer interactions with our sophisticated call log monitoring system. Analyze conversation patterns, identify areas for improvement, and refine your customer engagement strategies.",
    video:
      "https://trynexusai.imgix.net/assets/videos/monitor-call-log-prev.mp4",
  },
  {
    name: "chatbot",
    title: "24/7 Intelligent Customer Support",
    description:
      "Elevate your customer service with our AI-driven chatbot. This customizable widget seamlessly integrates into your website, providing instant, accurate responses and escalating complex issues to human agents when necessary.",
    video: "https://trynexusai.imgix.net/assets/videos/chatbot-prev.mp4",
  },
];

function Features() {
  return (
    <FlexColStart className="w-full h-auto bg-white-100 py-[8em] px-[5em] rounded-[20px] mb-4 ">
      <a id="features"></a>
      <FlexRowStartCenter className="w-auto px-4 py-2 rounded-lg border-[.5px] border-white-400/30 text-white-400 text-sm font-ppReg">
        <Boxes size={20} className="stroke-white-400" />
        Features
      </FlexRowStartCenter>

      <FlexColStart className="w-full">
        <h1 className="text-[3em] font-ppSB text-brown-102">
          Everything Your Business is Looking For
        </h1>
        <p className="text-brown-102 text-sm font-ppReg">
          Nexus provides a wide range of flexible features that are designed to
          help you and your businesses.
        </p>
      </FlexColStart>

      <div className="w-full h-auto grid grid-cols-2 p-0 gap-[8em] mt-10">
        {features.map((feature) => (
          <FeatureCard
            key={feature.name}
            title={feature.title}
            description={feature.description}
            video={feature.video}
            name={feature.name}
          />
        ))}
      </div>
      <br />
      <FlexColCenter className="w-full mt-10">
        <p className="text-white-400 font-ppM text-md">
          And many more features.
        </p>
      </FlexColCenter>
    </FlexColStart>
  );
}

export default Features;

type FeatureCardProps = {
  title: string;
  name: string;
  description: string;
  video?: string;
};

function FeatureCard({ title, description, video, name }: FeatureCardProps) {
  // increase the video speed
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 2; // Increase video speed by 50%
    }
  }, []);

  return (
    <FlexColStart className="w-full md:max-w-[800px] h-auto rounded-lg col-span-1">
      <FlexColCenter className="w-[550px] h-[300px] overflow-hidden  rounded-[12px] border-[.5px] border-white-400/20">
        <video
          ref={videoRef}
          src={video}
          className={cn(
            "w-[650px] h-full rounded-[12px]",
            name === "chatbot" ? "object-fit" : "object-cover"
          )}
          autoPlay
          loop
          muted
          controls={false}
        />
      </FlexColCenter>
      <FlexColStart className="w-full h-auto mt-4 gap-1">
        <h1 className="text-[1.2em] font-ppM text-brown-102">{title}</h1>
        <p className="text-white-400 text-sm font-ppReg">{description}</p>
      </FlexColStart>
    </FlexColStart>
  );
}
