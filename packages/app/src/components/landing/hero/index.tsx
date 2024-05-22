import { FlexColCenter, FlexColStartCenter } from "@/components/Flex";

function Hero() {
  return (
    <FlexColCenter className="w-full h-full min-h-[600px] text-center border-b-solid border-b-[1px] border-b-white-300 dark:border-b-white-600 ">
      <div id={""} className="absolute -top-12"></div>
      <h1 className="text-3xl md:text-5xl font-ppEB text-dark-100 dark:text-white-100">
        Ship your startup in{" "}
        <span className=" line-through text-3xl font-ppSB text-white-400 dark:text-white-300 ">
          Months
        </span>{" "}
        Weeks
      </h1>
      <p className="w-full md:max-w-[95%] max-w-[90%] text-white-400 dark:text-white-300 text-sm md:text-md font-ppReg">
        Launch your startup with our startup launchpad saving development time
        and cost.
      </p>
      <br />
      <br />
    </FlexColCenter>
  );
}

export default Hero;
