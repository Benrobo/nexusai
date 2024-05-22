import { FlexColCenter, FlexRowStartCenter } from "./Flex";
import { Spinner } from "./Spinner";

type Props = {
  showText?: boolean;
  text?: string;
};

export function FullPageLoader({ showText, text }: Props) {
  return (
    <FlexColCenter className="w-full min-h-screen bg-dark-100/30 z-[999] fixed top-0 left-0 backdrop-blur-lg">
      <FlexRowStartCenter className="w-auto">
        <Spinner size={20} color={"#fff"} />
        {showText && (
          <p className="text-white-100 text-[13px] font-ppReg">
            {text ?? "Loading..."}
          </p>
        )}
      </FlexRowStartCenter>
    </FlexColCenter>
  );
}
