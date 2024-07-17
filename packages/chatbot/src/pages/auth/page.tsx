import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowStart,
} from "@/components/Flex";
import { LockOpen, X } from "@/components/icons";
import Modal from "@/components/Modal";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/otp-input";
import React from "react";

export default function ChatWidgetAuthPage() {
  return <SignUp />;
}

function SignUp() {
  return (
    <Modal isOpen={true} isBlurBg={true} fixed>
      <FlexColStart className="w-full max-h-[600px] min-w-[400px] h-full bg-white-300 rounded-[22px] p-1">
        <FlexColStart className="w-full h-auto bg-white-100 rounded-[20px] relative">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all enableBounceEffect"
            onClick={() => {
              //   closeModal();
              //   addIntegrationMut.reset();
            }}
          >
            <X size={15} color="#000" />
          </button>

          <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
            <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
              <LockOpen size={20} className="stroke-white-100 p-1" />
            </FlexColCenter>

            <FlexColStart className="w-full gap-1">
              <h1 className="font-ppM font-bold text-lg">Create Account</h1>
              <p className="text-xs font-ppReg font-light text-gray-500">
                Create an account to get started.
              </p>
            </FlexColStart>
          </FlexRowStart>

          <FlexColStart className="w-full h-auto gap-4 px-6 pb-6">
            {false ? (
              <>
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border-[1px] border-white-400 rounded-md bg-white-300/20 text-xs font-ppReg"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border-[1px] border-white-400 rounded-md bg-white-300/20 text-xs font-ppReg"
                />
              </>
            ) : (
              <VerifyOTP />
            )}
            <Button className="w-full px-4 py-3 bg-dark-100 rounded-md text-xs font-ppReg text-white-100 enableBounceEffect hover:bg-brown-100">
              Create Account
            </Button>
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </Modal>
  );
}

function VerifyOTP() {
  return (
    <FlexColStartCenter className="w-full bg-white-100 rounded-[20px] px-10 py-8 gap-1">
      <h1 className="text-sm font-jb font-bold">Verify Email</h1>
      <p className="text-xs font-ppReg text-gray-500 mb-2">
        Enter the OTP sent to your email.
      </p>
      {/* otp input */}
      <InputOTP
        autoFocus
        maxLength={6}
        onComplete={(v: string) => {
          //   otp.current = v;
          //   verifyPhoneMut.mutate({
          //     otp: v,
          //     agentId: agent_id,
          //   });
        }}
        inputMode={"numeric"}
        // disabled={verifyPhoneMut.isPending}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </FlexColStartCenter>
  );
}
