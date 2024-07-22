import { FlexColStart } from "@/components/Flex";
import useSession from "@/hooks/useSession";
import React from "react";

export default function Dashboard() {
  const data = useSession();
  return (
    <FlexColStart className="w-full h-screen relative">
      {/* header */}
      <FlexColStart className="w-full h-auto px-8 py-7">
        <h1 className="text-xl font-ppM text-dark-100">Overview</h1>
        {/* dashboard cards */}
      </FlexColStart>
    </FlexColStart>
  );
}
