import {
  FlexColStart,
  FlexRowStart,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import { PhoneCall } from "@/components/icons";
import Button from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

export default function ManagePhoneNumber() {
  const formatNumber = (number: string) => {
    return number.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
  };

  return (
    <FlexColStart
      className={cn(
        "w-full h-auto px-0 py-4 rounded-md mt-5"
        // "bg-red-305/5 border-[2px] border-red-305/20"
      )}
    >
      <FlexColStart className="w-auto gap-0 px-4">
        <h1 className="text-lg font-jb font-bold text-dark-100">
          Active Number
        </h1>
        <span className="text-xs font-jb font-light text-white-400">
          Phone number assigned to this agent.
        </span>
      </FlexColStart>
      <FlexRowStartBtw
        className={cn(
          "w-full mt-4 px-4 py-4 rounded-md relative",
          "bg-red-305/5 border-[2px] border-red-305/20"
        )}
      >
        {false && (
          <span className="absolute left-[20em] top-2 rounded-full px-3 py-[3px] bg-dark-100 text-[10px] font-jb font-normal text-white-100 scale-[.80]">
            Renews on June 1, 2022
          </span>
        )}
        <FlexColStart className="w-auto gap-0 relative">
          <h1
            className={cn(
              "text-lg font-jb text-dark-100",
              false ? "font-extrabold" : "font-normal"
            )}
          >
            {false ? formatNumber("+18156467732") : "+1 (N/A) N/A-N/A"}
          </h1>

          <FlexRowStartCenter className="w-auto">
            <span className="text-xs font-jb font-light text-white-400">
              N/A
            </span>
            <span className="text-md -translate-y-1 font-jb font-light text-dark-100">
              .
            </span>
            <span className="text-xs font-jb font-light text-white-400">
              🇺🇸
            </span>
          </FlexRowStartCenter>
          <span className="text-[10px] font-jb font-light text-white-40 mt-2">
            Please purchase a number to activate this agent.
          </span>
        </FlexColStart>
        <Button
          intent={"dark"}
          className="w-[130px] h-[36px] px-4 text-xs font-ppReg drop-shadow disabled:bg-dark-100/70 disabled:text-white-100"
          // disabled={enableSaveChangesButton()}
          // onClick={saveChanges}
          enableBounceEffect={true}
          // isLoading={updateAgentSettingsMut.isPending || tabLoading}
        >
          <PhoneCall size={15} />
          Buy Number
        </Button>
      </FlexRowStartBtw>
    </FlexColStart>
  );
}
