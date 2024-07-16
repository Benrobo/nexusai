import { FlexRowStart, FlexRowStartBtw } from "../Flex";
import { MessagesSquare, X } from "../icons";

export default function TopNavigation() {
  return (
    <FlexRowStartBtw className="w-full h-auto bg-dark-100 px-6 py-5">
      <FlexRowStart className="w-auto gap-3">
        <MessagesSquare />
        <h1 className="text-md font-ppM text-white-100">Cassie</h1>
      </FlexRowStart>
      <button className=" enableBounceEffect">
        <X size={20} />
      </button>
    </FlexRowStartBtw>
  );
}
