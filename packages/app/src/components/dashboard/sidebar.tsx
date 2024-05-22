import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Button from "../ui/button";
import {
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "../Flex";
import { CaretSort } from "../icons";

export default function DashboardSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="w-full max-w-[250px] h-screen bg-dark-105 px-4 py-5">
      {/* business switcher */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            intent="tertiary"
            className="bg-dark-102 outline outline-[1px] outline-white-400/50 w-full min-h-[60px] py-4 hover:bg-dark-102/90 rounded-lg "
            childrenClass="w-full"
            rightIcon={<CaretSort size={15} />}
          >
            <FlexRowStartCenter className="w-full py-8">
              <span>🤖</span>
              <FlexColStart className="w-auto gap-0">
                <span className="text-sm font-ppM text-white-100">Med2.0</span>
                <span className="text-white-300 text-xs font-ppReg">
                  category
                </span>
              </FlexColStart>
            </FlexRowStartCenter>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <p className="text-dark-100 bg-red-200 p-3">welcome</p>
        </PopoverContent>
      </Popover>
      DashboardSidebar
    </div>
  );
}
