import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenter,
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
    <FlexColStart className="w-full h-full min-h-[600px] text-center relative">
      <div className="pattern-bg" />
      <FlexColStartCenter className="w-full h-full px-9 py-[10em] transition-all z-[10] scale-[.] lg:scale-[1] gap-0">
        <div className="flex-center relative w-[60px] h-[60px] mt-[3em] mb-[2em]">
          <img
            src="/assets/logo/nexus-logo-dark.svg"
            width={60}
            height={0}
            alt="logo"
            className="z-[3]"
          />
        </div>
        <FlexRowStartCenter className="w-auto px-9">
          <h1 className="text-[4em] font-ppEB text-white-100 whitespace-nowrap">
            Say goodbye to{" "}
          </h1>
          <div className="relative w-[400px] h-[3em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={phrases.goodbye[goodbyeIndex]}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-start"
              >
                <span className="text-[3.5em] font-ppEB text-red-305 whitespace-nowrap relative">
                  {phrases.goodbye[goodbyeIndex]}
                  <span className="text-sm w-[30px] h-[30px] flex-center absolute -top-3 -right-[4em] bg-red-200/10 rounded-full">
                    {phrases.goodbye[goodbyeIndex] === "Scam Calls" ? (
                      <OctagonX className="stroke-red-305" strokeWidth={2} />
                    ) : (
                      <X size={20} className="stroke-red-305" strokeWidth={3} />
                    )}
                  </span>
                </span>
              </motion.span>
            </AnimatePresence>
          </div>
        </FlexRowStartCenter>
        <FlexRowStartCenter className="w-auto">
          <h1 className="text-[4em] font-ppEB text-white-100 whitespace-nowrap">
            Hello to{" "}
          </h1>
          <div className="relative inline-block w-[400px] h-[4em]">
            <AnimatePresence mode="wait">
              <motion.div
                key={phrases.hello[helloIndex]}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-start"
              >
                <span className="text-[3.5em] font-ppEB text-green-100 whitespace-nowrap relative">
                  {phrases.hello[helloIndex]}
                  <span className="text-sm w-[30px] h-[30px] flex-center absolute -top-3 -right-[3em] bg-green-200 rounded-full">
                    {phrases.hello[helloIndex] === "Protected Calls" ? (
                      <ShieldAlert
                        size={18}
                        className="stroke-green-100"
                        strokeWidth={2}
                      />
                    ) : (
                      <CheckCheck
                        size={18}
                        className="stroke-green-100"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </FlexRowStartCenter>

        {/* auth button */}
        <FlexColCenter className="w-full">
          <button className="w-[200px] h-auto py-3 bg-dark-103 border-[3px] border-brown-100 rounded-full flex-center mt-[2em] text-white-100 stroke-white-100 gap-4 font-ppM enableBounceEffect">
            Get Started
            <SquareArrowOutUpRight size={15} className="ml-2" />
          </button>
        </FlexColCenter>

        {/* img preview */}
      </FlexColStartCenter>
    </FlexColStart>
  );
}

export default Hero;
