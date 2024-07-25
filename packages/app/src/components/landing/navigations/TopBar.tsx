"use client";
import { FlexRowStartCenter } from "@/components/Flex";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import React from "react";

function TopBar() {
  const [showSlideBar, setShowSlideBar] = React.useState(false);
  const [scrollY, setScrollY] = React.useState(0);
  const [isScrolledPast, setIsScrolledPast] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrollY(window.scrollY);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (scrollY > 30) {
      setIsScrolledPast(true);
    } else {
      setIsScrolledPast(false);
    }
  }, [scrollY]);

  //track when screen size changes
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowSlideBar(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full top-0 z-[800] bg-white-100 ">
      <FlexRowStartCenter
        className={cn(
          "w-full h-auto py-4 px-5 justify-between bg-transparent",
          isScrolledPast ? "backdrop-blur-md" : "backdrop-blur-xs"
        )}
      >
        <Link to="/">
          <FlexRowStartCenter className="w-fit gap-1">
            <img
              src="/assets/logo/nexus-logo-dark.svg"
              width={40}
              height={0}
              alt="logo"
              className=""
            />
            <span className="text-white-100 font-jb font-extrabold text-lg ml-2">
              Nexus
            </span>
          </FlexRowStartCenter>
        </Link>
      </FlexRowStartCenter>
    </div>
  );
}

export default TopBar;

export function TopBar2() {
  return (
    <div className="w-full bg-white-100 rounded-[20px] ">
      <FlexRowStartCenter
        className={cn("w-full h-auto py-4 px-5 justify-between bg-transparent")}
      >
        <Link to="/">
          <FlexRowStartCenter className="w-fit gap-1">
            <img
              src="/assets/logo/nexus-logo-dark.svg"
              width={40}
              height={0}
              alt="logo"
              className=""
            />
            <span className="text-dark-100 font-ppB font-extrabold text-lg ml-2">
              Nexus
            </span>
          </FlexRowStartCenter>
        </Link>
      </FlexRowStartCenter>
    </div>
  );
}
