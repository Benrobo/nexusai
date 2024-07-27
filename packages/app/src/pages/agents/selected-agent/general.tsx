import { FlexColStart } from "@/components/Flex";

export default function GeneralPage() {
  return (
    <div className="w-full max-w-[60%] h-screen px-20 py-10">
      <FlexColStart className="w-full h-full ">
        <FlexColStart className="gap-0 w-full">
          <h1 className="text-3xl font-semibold text-dark-100">General</h1>
          <p className="text-sm font-ppL text-white-400 mt-1">
            General information about the agent.
          </p>
        </FlexColStart>
      </FlexColStart>
    </div>
  );
}
