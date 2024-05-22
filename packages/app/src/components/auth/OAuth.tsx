import { FlexColCenter } from "@/components/Flex";
import env from "@/config/env";

export default function OAuth() {
  return (
    <FlexColCenter className="w-full dark:bg-transparent outline outline-white-300 px-[4em] py-[3em] rounded-md text-center shadow-lg drop-shadow-xl ">
      {/* logo */}
      <span className="text-xl">🔐</span>
      <h1 className="text-2xl font-ppB font-bold">
        Empower Your Business: Automate, Protect, Connect
      </h1>

      <br />
      <a
        href={`${env.API_URL}/auth/google`}
        className="w-full rounded-full px-5 py-3 border border-solid border-white-400/40 flex items-center justify-center gap-5 scale-[.95]"
      >
        <img width={20} src="/assets/images/logo/google.svg" />
        <span className="text-dark-100 font-ppReg font-semibold">
          Continue with Google
        </span>
      </a>
    </FlexColCenter>
  );
}
