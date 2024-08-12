import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ITooltipCompProps {
  text?: string;
  children: React.ReactNode;
}

export default function TooltipComp({ text, children }: ITooltipCompProps) {
  return (
    <TooltipProvider delayDuration={20}>
      <Tooltip>
        <TooltipTrigger className="w-auto">{children}</TooltipTrigger>
        {text && (
          <TooltipContent className="w-auto max-w-[500px]">
            <p className="font-ppReg text-xs">{text}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
