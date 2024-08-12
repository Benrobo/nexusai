import { FlexColCenter, FlexColStart, FlexRowCenter } from "@/components/Flex";
import Modal from "@/components/Modal";
import useSession from "@/hooks/useSession";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  const [modalOpen, setModalOpen] = useState(false);
  const visible = { opacity: 1, y: 0, transition: { duration: 0.5 } };
  const { loading, user } = useSession();

  return (
    <div className="w-full h-full bg-dark-100 rounded-[20px] overflow-hidden relative mb-2">
      <div className="pattern-bg absolute inset-0 z-0" />

      <FlexColCenter className="w-full h-[300px] absolute top-0">
        <div className="w-[250px] h-[250px] bg-white-100 blur-[150px] rounded-full -translate-y-[10em]" />
      </FlexColCenter>

      <div id="hero" />
      <motion.div
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, transition: { duration: 5 } }}
        variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
        className="w-full h-auto"
      >
        <FlexColCenter className="w-full h-full mt-[3em] z-[10]">
          <FlexColCenter className="w-full mx-auto max-w-[45%] text-center z-[20]">
            <FlexRowCenter className="mb-8 border-[2px] border-white-300/30 rounded-full text-xs font-ppReg bg-white-300/20 px-3 py-1 text-white-100">
              AI Driven Communication Platform
            </FlexRowCenter>
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible,
              }}
              className="text-3xl md:text-5xl font-ppB text-wrap text-white-100 whitespace-nowrap mb-3"
            >
              Redefine Efficient and Secure Communication with Nexus
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible,
              }}
              className="text-sm font-ppL text-white-300"
            >
              Nexus helps businesses and individuals to transform communication
              by boosting sales with intelligent AI assistants, securing calls
              from scammers, and offering 24/7 support all in one platform.
            </motion.p>
          </FlexColCenter>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible,
            }}
          >
            <FlexRowCenter className="mt-[1em] gap-9">
              <Link
                to={!loading && !user ? "/auth" : "/dashboard"}
                className="w-auto px-5 bg-white-100 font-ppReg py-3 rounded-2xl scale-[.90] enableBounceEffect"
              >
                Get Started
              </Link>
              <button
                className="w-auto px-5 border-[1px] border-white-300/30 bg-brown-100 font-ppReg py-3 rounded-2xl text-white-100 scale-[.90] enableBounceEffect"
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                How it Works
              </button>
            </FlexRowCenter>
          </motion.div>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible,
            }}
          >
            <FlexColCenter className="mt-[3em] mx-auto max-w-[90%] translate-y-10">
              <img
                src={`/assets/images/header/illus-4.svg?dpr=1`}
                alt="hero"
                className="w-full h-full object-left object-cover"
              />
            </FlexColCenter>
          </motion.div>
        </FlexColCenter>
      </motion.div>

      <Modal
        fixed={true}
        isBlurBg={true}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <FlexColStart className="w-full h-full bg-white-300 rounded-[22px] px-2 py-2 gap-0">
          <iframe
            width="900"
            height="600"
            src="https://www.youtube.com/embed/kgVcDrm5Zr4?si=SC10PlteRAXH46h_"
            title="YouTube video player"
            // @ts-ignore
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen
            className="rounded-[20px]"
          ></iframe>
        </FlexColStart>
      </Modal>
    </div>
  );
}
