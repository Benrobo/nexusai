import { sendMessageToParentIframe } from "@/lib/utils";
import { FlexRowStart, FlexRowStartBtw } from "../Flex";
import { MessagesSquare, X } from "../icons";
import { useDataCtx } from "@/context/DataCtx";

export default function TopNavigation() {
  const { account } = useDataCtx();
  return (
    <FlexRowStartBtw className="w-full h-auto bg-dark-100 px-6 py-5">
      <FlexRowStart className="w-auto gap-3">
        <MessagesSquare />
        <h1 className="text-md font-ppM text-white-100">
          {account?.chatbotConfig?.brand_name ?? "Chatbot"}
        </h1>
      </FlexRowStart>
      <button
        className=" enableBounceEffect"
        onClick={() => {
          // send message to iframe parent
          sendMessageToParentIframe({
            type: "close-frame",
          });
        }}
      >
        <X size={20} />
      </button>
    </FlexRowStartBtw>
  );
}
