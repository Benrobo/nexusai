import { Link } from "react-router-dom";
import {
  FlexColStart,
  FlexRowCenterBtw,
  FlexRowEndCenter,
  FlexRowStartCenter,
} from "./Flex";

function Footer() {
  return (
    <FlexColStart className="w-full h-auto py-9 pb-9 bg-white-100 rounded-2xl border-t-solid border-t-[1px] border-t-gray-100/20 ">
      <FlexRowCenterBtw className="w-full h-full px-10 py-4">
        <FlexRowStartCenter className="w-auto gap-1">
          <img
            src="/assets/logo/nexus-logo-dark.svg"
            width={30}
            height={0}
            alt="veloz logo"
            className=""
          />
          <p className="text-dark-100 dark:text-white-100 text-1xl font-ppSB">
            Nexusai
          </p>
        </FlexRowStartCenter>
        <Link
          to="https://www.privacyboard.co/app/preview-privacy-policy"
          target="_blank"
          className="text-xs font-ppReg text-dark-100 underline"
        >
          Privacy & Policy
        </Link>
        <FlexRowEndCenter className="w-auto">
          <span className="text-white-400 dark:text-white-300/50 font-ppReg text-[13px] ">
            © {new Date().getFullYear()} Nexusai. All rights reserved.
          </span>
        </FlexRowEndCenter>
      </FlexRowCenterBtw>
    </FlexColStart>
  );
}

export default Footer;
