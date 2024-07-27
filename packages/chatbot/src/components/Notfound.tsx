import { useRef } from "react";
import { FlexColCenter } from "./Flex";
import Button from "./ui/button";

export default function Notfound() {
  const agent_id = useRef<null | string>(
    localStorage.getItem("nexus_agent_id")
  );
  return (
    <FlexColCenter className="w-full h-screen gap-1">
      <h1 className="text-lg font-ppB text-dark-100">
        {agent_id.current ? `Are you lost?` : "Invalid Chatbot Configuration."}
      </h1>
      <p className="text-md font-ppReg text-white-400">
        {agent_id.current
          ? "The page you are looking for is not available."
          : "Please contact the administrator for assistance."}
      </p>

      {agent_id?.current && (
        <Button
          href={`/${agent_id.current}`}
          intent="dark"
          className="bg-brown-100 text-white-100 text-xs font-ppReg mt-4 rounded-full px-5 enableBounceEffect"
        >
          Go back home
        </Button>
      )}
    </FlexColCenter>
  );
}
