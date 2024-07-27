import { FlexColCenter, FlexColStart } from "@/components/Flex";
import ProtectPage from "@/components/ProtectPage";

function HomePage() {
  return (
    <FlexColStart className="w-full h-full">
      <FlexColCenter className="w-full h-auto min-h-[70%]">
        <img
          width={80}
          src={"/assets/images/logos/nexus-dark.svg"}
          className="rounded-full"
        />
        <FlexColCenter className="gap-1 text-center px-6">
          <h1 className="font-ppB text-lg text-dark-100">NexusAI</h1>
          <h1 className="font-ppReg text-sm text-white-400">
            AI-powered Chatbot created by Nexus to help deal with customer
            support.
          </h1>
        </FlexColCenter>
      </FlexColCenter>
    </FlexColStart>
  );
}

export default ProtectPage(HomePage);
