import React from "react";
import { FlexColStart, FlexColStartCenter, FlexRowStartCenter } from "./Flex";
// import SOCIALS from "@/data/socials";
import { Twitter } from "@/components/icons";
import { Link } from "react-router-dom";
// import { LANDING_TOP_BAR_NAV } from "@/data/landing/navigation";

const legalData = [
  {
    title: "Terms and Condition",
    url: "/legal/terms-and-condition",
  },
  {
    title: "Privacy and Policy",
    url: "https://www.privacyboard.co/company/veloz?tab=privacy-policy",
  },
];

function Footer() {
  return (
    <FlexColStart className="w-full h-auto py-9 pb-9 bg-white-100/30 dark:bg-dark-102 border-t-solid border-t-[1px] border-t-gray-100/20 ">
      <div className="w-full h-full gap-10 grid grid-cols-1 md:grid-cols-3 px-9 md:px-[5em]">
        <FlexColStart className="w-full h-full">
          <FlexRowStartCenter className="gap-1">
            <img
              src="/images/logo/logo.png"
              width={30}
              height={0}
              alt="veloz logo"
              className=""
            />
            <p className="text-dark-100 dark:text-white-100 text-1xl font-ppSB">
              Veloz
            </p>
          </FlexRowStartCenter>
          <span className="text-white-400 dark:text-white-300/50 font-ppReg text-[13px] ">
            © 2021 Veloz. All rights reserved.
          </span>
          {/* {SOCIALS.filter((d) => d.url.length > 0).map((s, i) => (
            <a href={s.url} key={i}>
              {s.name === "twitter" ? (
                <Twitter
                  size={20}
                  className="text-dark-100 dark:text-blue-300"
                />
              ) : null}
            </a>
          ))} */}
        </FlexColStart>
        <FlexColStart className="w-full h-full justify-start">
          <FlexColStart>
            <h1 className="text-white-400 text-[15px] font-ppSB">Links</h1>
            {/* {LANDING_TOP_BAR_NAV.map((d, i) => (
              <Link href={d.href} key={i} className="leading-none">
                <span className="text-dark-100 dark:text-white-200 text-[12px] hover:underline font-ppSB ">
                  {d.name}
                </span>
              </Link>
            ))} */}
          </FlexColStart>
        </FlexColStart>
        <FlexColStart className="w-full h-full">
          <FlexColStart>
            <h1 className="text-white-400 text-[15px] font-ppSB">Legal</h1>
            {legalData.map((d, i) => (
              <Link to={d.url} key={i} className="leading-none">
                <span className="text-dark-100 dark:text-white-200 text-[12px] hover:underline font-ppSB ">
                  {d.title}
                </span>
              </Link>
            ))}
          </FlexColStart>
        </FlexColStart>
      </div>
    </FlexColStart>
  );
}

export default Footer;
