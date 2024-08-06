import {
  FlexRowCenter,
  FlexRowStartBtw,
  FlexRowStartCenter,
} from "@/components/Flex";
import useSession from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const navigations = [
  {
    link: "#features",
    title: "Features",
  },
  {
    link: "#why-nexus",
    title: "Why Nexus",
  },
  {
    link: "#get-started",
    title: "Get Started",
  },
];

export default function TopBar() {
  const { loading, user } = useSession();
  return (
    <div className="w-full bg-white-100 rounded-[20px] ">
      <FlexRowStartBtw
        className={cn("w-full h-auto py-4 px-5 justify-between bg-transparent")}
      >
        <FlexRowStartCenter className="w-auto">
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

          <FlexRowCenter className="gap-10 ml-10">
            {navigations.map((nav) => (
              <a href={nav.link} key={nav.title}>
                <span className="text-white-400 font-ppM text-sm hover:text-dark-105 transition-all">
                  {nav.title}
                </span>
              </a>
            ))}
          </FlexRowCenter>
        </FlexRowStartCenter>

        <FlexRowCenter className="gap-9">
          {!loading && !user ? (
            <>
              <Link
                to="/auth"
                className="w-auto px-5 text-xs bg-white-100 font-ppReg py-3 rounded-2xl enableBounceEffect border-[1px] border-white-400/30"
              >
                Sign in
              </Link>
              <Link
                to="/auth"
                className="w-auto text-xs px-5 border-[1px] border-white-300/30 bg-brown-103 font-ppReg py-3 rounded-2xl text-white-100 enableBounceEffect"
              >
                Get Started
              </Link>
            </>
          ) : !loading && user ? (
            <Link
              to="/dashboard"
              className="w-auto text-xs px-5 border-[1px] border-white-300/30 bg-brown-103 font-ppReg py-3 rounded-2xl text-white-100 enableBounceEffect"
            >
              Dashboard
            </Link>
          ) : null}
        </FlexRowCenter>
      </FlexRowStartBtw>
    </div>
  );
}
