import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenter,
  FlexRowCenterBtw,
} from "@/components/Flex";
import { LockOpen, Trash, User } from "@/components/icons";
import ProtectPage from "@/components/ProtectPage";
import Button from "@/components/ui/button";

function Account() {
  return (
    <FlexColCenter className="w-full h-auto py-10">
      <h1 className="font-ppM text-md text-dark-100">Account Details</h1>

      <br />
      <br />

      <img
        src="/assets/images/logos/nexus-dark.svg"
        width={80}
        className="rounded-full"
      />
      {/* chatwidget user account details */}
      <FlexColCenter className="gap-1 text-center px-6 ">
        <h1 className="font-ppB text-md text-dark-100">Peter Parker</h1>
        <p className="font-ppReg text-sm text-white-400">peter@gmail.com</p>
      </FlexColCenter>

      <FlexRowCenter className="w-full px-[2em] mt-10">
        <Button className="w-full px-10 rounded-xl bg-white-300/30 text-xs text-dark-100 border-[.5px] border-white-400/30 hover:bg-white-400/20 enableBounceEffect font-ppM">
          <LockOpen size={15} className="stroke-dark-100" />
          <span>Logout</span>
        </Button>
      </FlexRowCenter>

      <FlexColCenter className="w-full px-[2em] mt-10">
        <FlexColStart className="w-full px-5 py-3 border-[1px] border-red-305 bg-red-305/10 rounded-md">
          <h1 className="font-ppM text-sm text-red-305">Danger Zone</h1>
          <Button className="w-full px-10 rounded-xl bg-red-305/80 text-xs text-white-100  hover:bg-red-305 enableBounceEffect font-ppM">
            <Trash size={15} className="stroke-white-100" />
            <span>Delete Account</span>
          </Button>
        </FlexColStart>
      </FlexColCenter>
    </FlexColCenter>
  );
}

export default ProtectPage(Account);
