"use client";
import { FlexColStart } from "@/components/Flex";
import Footer from "@/components/Footer";
import { FAQ, Features, Hero } from "@/components/landing";
import { Hero2 } from "@/components/landing/hero";
import TopBar, { TopBar2 } from "@/components/landing/navigations/TopBar";

export default function Home() {
  return (
    <FlexColStart className="w-full h-screen hideScrollBar overflow-auto overflow-x-hidden scroll-smooth bg-white-300 px-4 py-5 ">
      {/* navigation section */}
      <TopBar2 />

      {/* components sections */}
      <Hero2 />
      {/* <Features /> */}
      {/* <FAQ /> */}
      {/* <Footer /> */}

      {/* waitlist page (if in use, comment out the above sections including the footer and topbar) */}
      {/* <WaitlistPage /> */}
    </FlexColStart>
  );
}

// export default function Home() {
//   return (
//     <FlexColStart className="w-full h-screen hideScrollBar overflow-auto overflow-x-hidden scroll-smooth bg-dark-105 px-4 py-2 ">
//       {/* navigation section */}
//       <TopBar />

//       {/* components sections */}
//       <Hero />
//       {/* <Features /> */}
//       {/* <FAQ /> */}
//       {/* <Footer /> */}

//       {/* waitlist page (if in use, comment out the above sections including the footer and topbar) */}
//       {/* <WaitlistPage /> */}
//     </FlexColStart>
//   );
// }
