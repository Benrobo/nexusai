import { cn } from "@/lib/utils";
import { FlexColCenter, FlexRowStartCenter } from "./Flex";
import { Spinner } from "./Spinner";

type Props = {
  showText?: boolean;
  text?: string;
  fixed?: boolean;
  blur?: boolean;
};

export function FullPageLoader({ showText, text, fixed, blur }: Props) {
  return (
    <FlexColCenter
      className={cn(
        "w-full min-h-full z-[999]",
        fixed && "fixed top-0 left-0",
        blur && "backdrop-blur-lg bg-white-100/50"
      )}
    >
      <FlexRowStartCenter className="w-auto">
        <Spinner size={20} color={"#000"} />
        {showText && (
          <p className="text-dark-100 text-[13px] font-ppReg">
            {text ?? "Loading..."}
          </p>
        )}
      </FlexRowStartCenter>
    </FlexColCenter>
  );
}

export function ChildLoader({
  color,
  className,
}: {
  color?: string;
  className?: React.ComponentProps<"div">["className"];
}) {
  return (
    <FlexColCenter className={cn("w-full h-full", className)}>
      <Spinner size={20} color={color ?? "#000"} />
    </FlexColCenter>
  );
}
