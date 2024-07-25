import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenter,
  FlexRowStart,
  FlexRowStartCenter,
} from "@/components/Flex";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Arrow17 } from "@/components/HandyArrows";
import {
  CheckCheck,
  OctagonX,
  ShieldAlert,
  SquareArrowOutUpRight,
  X,
} from "@/components/icons";

const phrases = {
  goodbye: ["Scam Calls", "Sales Delays", "Restricted Support"],
  hello: ["Protected Calls", "Instant Deals", "24/7 Support"],
};

const duration = 5000;

function Hero() {
  const [goodbyeIndex, setGoodbyeIndex] = useState(0);
  const [helloIndex, setHelloIndex] = useState(0);

  useEffect(() => {
    const goodbyeInterval = setInterval(() => {
      setGoodbyeIndex((prevIndex) => (prevIndex + 1) % phrases.goodbye.length);
    }, duration);

    const helloInterval = setInterval(() => {
      setHelloIndex((prevIndex) => (prevIndex + 1) % phrases.hello.length);
    }, duration);

    return () => {
      clearInterval(goodbyeInterval);
      clearInterval(helloInterval);
    };
  }, []);

  return (
    <FlexRowStart className="w-full h-full relative">
      {/* <div className="pattern-bg absolute inset-0 z-0" /> */}

      <div className="w-1/2 h-1/2 bg-white-300/50 md:bg-white-300/20 fixed top-[5em] left-[10em] md:-top-[5em] md:-left-[10em] blur-[350px] md:blur-[250px] rounded-full" />

      {/* Left side: Animated Text */}
      <FlexColStart className="w-full md:w-1/2 h-full px-16 py-24 z-10 justify-center">
        <FlexColStart className="w-full md:w-[95%] items-center justify-center md:justify-start md:items-start text-wrap flex-wrap">
          <h1 className="text-3xl md:text-5xl text-center md:text-start font-ppEB text-wrap text-white-100 whitespace-nowrap mb-3">
            Nexus: Your Partner in Secure and Efficient Communication
          </h1>
        </FlexColStart>
        <div className="w-full max-w-2xl">
          <FlexColStart className="w-full items-center justify-center md:items-start md:text-left gap-4">
            <h1 className="text-[16px] hidden md:inline-block font-ppReg text-white-300 whitespace-nowrap">
              Say goodbye to{" "}
              <span className="relative inline-block w-full md:w-[300px]">
                {" "}
                {/* Adjust width as needed */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phrases.goodbye[goodbyeIndex]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute text-red-305 -top-4 md:left-2 font-ppEB"
                  >
                    {phrases.goodbye[goodbyeIndex]}
                    <span className="text-sm w-[25px] h-[25px] flex-center absolute -top-2 -right-[3em] bg-red-200/10 rounded-full">
                      {phrases.goodbye[goodbyeIndex] === "Scam Calls" ? (
                        <OctagonX
                          className="stroke-red-305"
                          strokeWidth={2}
                          size={15}
                        />
                      ) : (
                        <X
                          size={15}
                          className="stroke-red-305"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <h1 className="text-[16px] hidden md:inline-block font-ppReg text-white-300 whitespace-nowrap mb-12">
              Hello to{" "}
              <span className="relative inline-block w-full md:w-[300px]">
                {" "}
                {/* Adjust width as needed */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phrases.hello[helloIndex]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute text-green-100 -top-4 left-2 font-ppEB"
                  >
                    {phrases.hello[helloIndex]}
                    <span className="text-sm w-[25px] h-[25px] flex-center absolute -top-2 -right-[3em] bg-green-200 rounded-full">
                      {phrases.hello[helloIndex] === "Protected Calls" ? (
                        <ShieldAlert
                          size={15}
                          className="stroke-green-100"
                          strokeWidth={2}
                        />
                      ) : (
                        <CheckCheck
                          size={15}
                          className="stroke-green-100"
                          strokeWidth={3}
                        />
                      )}
                    </span>
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            {/* Get Started button */}
            {/* <button className="px-8 py-4 bg-black text-white rounded-full text-lg font-ppM flex items-center">
              Get Started
              <SquareArrowOutUpRight size={20} className="ml-2" />
            </button> */}
            <button className="hero-button min-w-[150px] enableBounceEffect">
              <div className="button-overlay"></div>
              <span>
                Get Started
                <SquareArrowOutUpRight size={20} className="ml-2" />
              </span>
            </button>
          </FlexColStart>
        </div>
      </FlexColStart>

      {/* Right side: Animated Images */}
      <FlexColCenter className="w-1/2 h-full hidden md:flex relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={phrases.hello[helloIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              src={`/assets/images/header/illus-${helloIndex + 1}.svg`}
              alt="hero"
              className="w-full h-full object-left object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </FlexColCenter>
    </FlexRowStart>
  );
}

export default Hero;
