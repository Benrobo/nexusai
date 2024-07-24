"use client";
import {
  FlexColStart,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowEndCenter,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
// import { LANDING_TOP_BAR_NAV } from "@/data/landing/navigation";
import useTheme from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { ChevronRight, Menu, Moon, SunMoon, X } from "@/components/icons";
import { Link } from "react-router-dom";
import React from "react";
// import useAuthUser from "@/hooks/useAuthUser";

function TopBar() {
  const { theme, toggleTheme } = useTheme();
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
    <div className="w-full fixed top-0 z-[800] bg-none ">
      <FlexRowStartCenter
        className={cn(
          "w-full h-auto py-4 px-5 bg-dark-100 justify-between",
          isScrolledPast ? "backdrop-blur-md" : "backdrop-blur-md"
        )}
      >
        <Link to="/">
          <FlexRowStartCenter className="w-fit gap-1">
            <img
              src="/assets/logo/nexus-logo.svg"
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
