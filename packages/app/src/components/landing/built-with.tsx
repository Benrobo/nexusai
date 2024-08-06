import { cn } from "@/lib/utils";
import { FlexColCenter, FlexRowCenter } from "../Flex";

const technologies = [
  { name: "gemini", path: "/assets/images/logo/gemini.svg" },
  { name: "firebase", path: "/assets/images/logo/firebase.svg" },
  { name: "twilio", path: "/assets/images/logo/twilio.svg" },
  { name: "xilab", path: "/assets/images/logo/xilab.svg" },
  { name: "neon", path: "/assets/images/logo/neon.svg" },
];

export default function BuiltWith() {
  return (
    <FlexColCenter className="w-full h-[200px] max-h-[250px] bg-white-100 py-2 rounded-[20px] mb-4 mt-3">
      <h1 className="text-sm font-ppM text-white-400/50">
        Built with trusted technologies
      </h1>
      <FlexRowCenter className="flex justify-center items-center space-x-4 mt-2 gap-10">
        {technologies.map((t) => (
          <img
            key={t.name}
            src={t.path}
            alt={t.name}
            className={cn(
              t.name === "gemini" && "-translate-y-1",
              "transition-all grayscale hover:grayscale-0"
            )}
            width={t.name === "gemini" ? 90 : 100}
          />
        ))}
      </FlexRowCenter>
    </FlexColCenter>
  );
}
