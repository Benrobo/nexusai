import { FlexColStart, FlexColStartCenter } from "@/components/Flex";
import Modal from "@/components/Modal";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/otp-input";
import { X } from "../icons";
import { useMutation } from "@tanstack/react-query";
import { verifyPhone } from "@/http/requests";
import toast from "react-hot-toast";
import { useRef } from "react";

interface IVerifyPhoneProps {
  closeModal: () => void;
  isOpen: boolean;
  refetchVerifiedPhone?: () => void;
  agent_id: string;
}

export default function VerifyPhoneModal({
  closeModal,
  isOpen,
  refetchVerifiedPhone,
  agent_id,
}: IVerifyPhoneProps) {
  const otp = useRef("");
  const verifyPhoneMut = useMutation({
    mutationFn: async (data: any) => await verifyPhone(data),
    onSuccess: () => {
      toast.success("Phone number verified successfully");
      setTimeout(() => {
        closeModal();
        refetchVerifiedPhone && refetchVerifiedPhone();
      }, 1000);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
      otp.current = "";
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      isBlurBg
      fixed={true}
      className="w-full h-full bg-opacity-50"
    >
      <FlexColStart className="w-full min-w-[400px] h-full bg-white-300 rounded-[22px] p-1 relative">
        <button
          className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all"
          onClick={closeModal}
        >
          <X size={15} color="#000" />
        </button>
        <FlexColStartCenter className="w-full bg-white-100 rounded-[20px] px-10 py-8">
          <h1 className="text-sm font-jb font-bold">Verify Phone Number</h1>
          <p className="text-xs font-ppReg text-gray-500">
            Verify your phone number to continue.
          </p>
          <br />
          {/* otp input */}
          <InputOTP
            autoFocus
            maxLength={6}
            onComplete={(v: string) => {
              otp.current = v;
              verifyPhoneMut.mutate({
                otp: v,
                agentId: agent_id,
              });
            }}
            inputMode={"numeric"}
            disabled={verifyPhoneMut.isPending}
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
      </FlexColStart>
    </Modal>
  );
}
