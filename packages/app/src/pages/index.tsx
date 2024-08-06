"use client";
import Footer from "@/components/Footer";
import { Features, Hero } from "@/components/landing";
import BuiltWith from "@/components/landing/built-with";
import GetStarted from "@/components/landing/get-started";
import TopBar from "@/components/landing/navigations/TopBar";
import WhyNexus from "@/components/landing/whyNexus";
import UnsupportedViewport from "@/components/UnsupportedViewport";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  return (
    <>
      <UnsupportedViewport />
      <AnimatePresence mode="wait">
        <div className="w-full h-screen hideScrollBar2 overflow-y-scroll overflow-x-hidden scroll-smooth bg-white-300 px-4 py-5 gap-10">
          <TopBar />
          <Hero />
          <BuiltWith />
          <Features />
          <WhyNexus />
          <GetStarted />
          <Footer />
        </div>
      </AnimatePresence>
    </>
  );
}
