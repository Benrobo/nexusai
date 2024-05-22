"use client";
import { FlexColStart } from "@/components/Flex";
import Footer from "@/components/Footer";
import { FAQ, Features, Hero } from "@/components/landing";
import TopBar from "@/components/landing/navigations/TopBar";

export default function Home() {
  return (
    <FlexColStart className="w-full h-screen hideScrollBar overflow-auto overflow-x-hidden mt-[4.5em] scroll-smooth">
      {/* navigation section */}
      <TopBar />

      {/* components sections */}
      <Hero />
      <Features />
      <FAQ />
      <Footer />

      {/* waitlist page (if in use, comment out the above sections including the footer and topbar) */}
      {/* <WaitlistPage /> */}
    </FlexColStart>
  );
}
