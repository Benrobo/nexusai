import { Link } from "react-router-dom";
import { FlexColCenter, FlexRowCenter } from "../Flex";

export default function GetStarted() {
  return (
    <FlexColCenter className="w-full h-auto pb-[5em] min-h-[400px] bg-dark-100 rounded-[20px] relative overflow-hidden mb-4 ">
      <div className="pattern-bg absolute inset-0 z-0" />

      <FlexColCenter className="w-full h-[300px] absolute bottom-0">
        <div className="w-[250px] h-[250px] bg-cyan-200 blur-[150px] rounded-full translate-y-[10em]" />
      </FlexColCenter>

      <a id="get-started"></a>
      <FlexColCenter className="w-full h-full mt-[3em] z-[10]">
        <FlexColCenter className="w-full px-10 md:max-w-[70%] text-center">
          <h1 className="text-3xl md:text-5xl w-full lg:max-w-[50%] md:max-w-[70%] font-ppB text-wrap text-white-100 whitespace-nowrap mb-3">
            Maximize Safety, Maximize Profit
          </h1>
          <p className="text-sm font-ppL text-white-300">
            Nexus enables businesses to transform communication by boosting
            sales with intelligent AI assistants, securing calls from scammers,
            and offering 24/7 support via chatbots.
          </p>
        </FlexColCenter>
        <FlexRowCenter className="mt-[1em] gap-9">
          <Link
            to="/#hero"
            className="w-auto px-5 border-[1px] border-white-300/30 bg-brown-100 font-ppReg py-3 rounded-2xl text-white-100 scale-[.90] enableBounceEffect"
            onClick={() => {
              document.getElementById("hero")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            How it Works
          </Link>
        </FlexRowCenter>
      </FlexColCenter>
    </FlexColCenter>
  );
}
