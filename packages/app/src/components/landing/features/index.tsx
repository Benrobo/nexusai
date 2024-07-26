import {
  FlexColCenter,
  FlexColStart,
  FlexRowStartCenter,
} from "@/components/Flex";
import { Boxes } from "@/components/icons";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "dashboard-analytics",
    title: "Comprehensive Dashboard Analytics",
    description:
      "Gain actionable insights with our robust dashboard analytics. Visualize key metrics, track performance trends, and make data-driven decisions to optimize your business operations efficiently.",
    video: "/assets/videos/dashboard-prev.mp4",
  },
  {
    name: "create-agent",
    title: "Intelligent Agent Creation",
    description:
      "Streamline your business processes by deploying multiple AI-powered agents. These versatile assistants enhance lead generation, provide round-the-clock support, and employ advanced algorithms to detect and prevent fraudulent activities.",
    video: "/assets/videos/create-agent-prev.mp4",
  },
  {
    name: "add-knowledge-base",
    title: "Dynamic Knowledge Base Integration",
    description:
      "Empower your agents with a comprehensive, easily updatable knowledge base. This feature enables rapid, accurate responses to customer queries, ensuring consistent service quality even outside of business hours.",
    video: "/assets/videos/add-kb-prev.mp4",
  },
  {
    name: "add-integration",
    title: "Seamless Third-Party Integrations",
    description:
      "Enhance your operational efficiency by integrating with a wide array of industry-leading tools and services. Our flexible API allows for custom connections, creating a cohesive ecosystem tailored to your specific business needs.",
    video: "/assets/videos/add-int-prev.mp4",
  },
  {
    name: "monitor-call-logs",
    title: "Advanced Call Log Analytics",
    description:
      "Leverage detailed insights from agent-customer interactions through our sophisticated call log monitoring system. Analyze conversation patterns, identify areas for improvement, and refine your customer engagement strategies.",
    video: "/assets/videos/monitor-call-log-prev.mp4",
  },
  {
    name: "chatbot",
    title: "24/7 Intelligent Customer Support",
    description:
      "Elevate your customer service with our AI-driven chatbot. This customizable widget seamlessly integrates into your website, providing instant, accurate responses and escalating complex issues to human agents when necessary.",
    video: "/assets/videos/chatbot-prev.mp4",
  },
];

function Features() {
  return (
    <FlexColStart className="w-full h-auto bg-white-100 py-[8em] px-[5em] rounded-[20px]">
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

      <div className="w-full h-auto grid grid-cols-2 p-0 gap-[4em] mt-10">
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
  return (
    <FlexColStart className="w-full md:max-w-[800px] h-auto rounded-lg col-span-1">
      <FlexColCenter className="w-[550px] h-[300px] overflow-hidden  rounded-[12px] border-[.5px] border-white-400/20">
        <video
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
