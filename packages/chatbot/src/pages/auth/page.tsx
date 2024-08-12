import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenter,
  FlexRowEnd,
  FlexRowStart,
  FlexRowStartBtw,
} from "@/components/Flex";
import { LockOpen, X } from "@/components/icons";
import Modal from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/otp-input";
import { useDataCtx } from "@/context/DataCtx";
import { useLocation } from "@/hooks/useLocation";
import { signInUser, signUpUser, verifyAccount } from "@/http/requests";
import type { ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { toast } from "react-hot-toast";

type ActiveTabs = "signin" | "signup";

export default function ChatWidgetAuthPage() {
  const { authVisible, setAuthVisible } = useDataCtx();
  const [activeTab, setActiveTab] = React.useState<ActiveTabs>("signup");

  const closeAuthModal = () => setAuthVisible(false);

  return activeTab === "signin" ? (
    <SignIn
      switchTab={(tab) => setActiveTab(tab)}
      isOpen={authVisible}
      closeModal={closeAuthModal}
    />
  ) : (
    <SignUp
      switchTab={(tab) => setActiveTab(tab)}
      isOpen={authVisible}
      closeModal={closeAuthModal}
    />
  );
}

interface AuthTab {
  switchTab: (tab: ActiveTabs) => void;
  isOpen: boolean;
  closeModal: () => void;
}

function SignUp({ switchTab, closeModal, isOpen }: AuthTab) {
  const [otpRequested, setOtpRequested] = React.useState(false);
  const [accountDetails, setAccountDetails] = React.useState({
    name: "",
    email: "",
  });
  const { location } = useLocation();
  const signUpMut = useMutation({
    mutationFn: async (data: any) => await signUpUser(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      toast.success(resp?.message);
      setOtpRequested(true);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
    },
  });
  const sendOTPMut = useMutation({
    mutationFn: async (data: any) => await signInUser(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      toast.success(resp?.message);
      setOtpRequested(true);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
    },
  });
  const verifyEmailMut = useMutation({
    mutationFn: async (data: any) => await verifyAccount(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      toast.success(resp?.message);
      setOtpRequested(false);
      window?.location.reload();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
      setOtpRequested(false);
    },
  });

  const handleSignup = () => {
    const payload = {
      ...accountDetails,
    } as {
      name: string;
      email: string;
      city?: string;
      state?: string;
      country_code?: string;
    };
    if (location?.city) payload["city"] = location.city;
    if (location?.state) payload["state"] = location.state;
    if (location?.countryCode) payload["country_code"] = location.countryCode;

    if (!payload.name || !payload.email) {
      toast.error("Please fill all fields");
      return;
    }

    signUpMut.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} isBlurBg={true} fixed onClose={() => closeModal()}>
      <FlexColStart className="w-full max-h-[600px] min-w-[400px] h-full bg-white-300 rounded-[22px] p-1">
        <FlexColStart className="w-full h-auto bg-white-100 rounded-[20px] relative">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all enableBounceEffect"
            onClick={() => {
              closeModal();
              setOtpRequested(false);
              setAccountDetails({ name: "", email: "" });
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
            {!otpRequested ? (
              <>
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border-[1px] border-white-400 rounded-md bg-white-300/20 text-xs font-ppReg"
                  value={accountDetails.name}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border-[1px] border-white-400 rounded-md bg-white-300/20 text-xs font-ppReg"
                  value={accountDetails.email}
                  onChange={(e) =>
                    setAccountDetails((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />

                <Button
                  intent={"dark"}
                  className="w-full px-4 py-3 bg-dark-100 rounded-md text-xs font-ppReg text-white-100 enableBounceEffect hover:bg-brown-100"
                  disabled={signUpMut.isPending}
                  isLoading={signUpMut.isPending}
                  onClick={handleSignup}
                >
                  Create Account
                </Button>
              </>
            ) : (
              <VerifyOTP
                verify={(otp) => {
                  verifyEmailMut.mutate({
                    email: accountDetails.email,
                    otp,
                  });
                }}
                resendOtp={() => {
                  sendOTPMut.mutate({
                    email: accountDetails.email,
                  });
                }}
                disabled={verifyEmailMut.isPending}
                loading={verifyEmailMut.isPending}
              />
            )}

            <FlexRowCenter className="w-full">
              <p className="text-center text-xs text-white-400 font-ppReg">
                Have an account?{" "}
                <button
                  className="font-ppM text-dark-100 underline"
                  onClick={() => switchTab("signin")}
                >
                  Sign-in
                </button>
              </p>
            </FlexRowCenter>
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </Modal>
  );
}

function SignIn({ switchTab, closeModal, isOpen }: AuthTab) {
  const { location } = useLocation();
  const [otpRequested, setOtpRequested] = useState(false);
  const [email, setEmail] = useState("");
  const signInMut = useMutation({
    mutationFn: async (data: any) => await signInUser(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      toast.success(resp?.message);
      setOtpRequested(true);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
    },
  });
  const verifyEmailMut = useMutation({
    mutationFn: async (data: any) => await verifyAccount(data),
    onSuccess: (data) => {
      const resp = data as ResponseData;
      toast.success(resp?.message);
      setOtpRequested(false);
      window?.location.reload();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
    },
  });

  const handleSignin = () => {
    if (!email || email.length === 0) {
      toast.error("Input must not be empty");
      return;
    }
    signInMut.mutate({
      email,
      country: location?.countryCode,
      state: location?.state,
      city: location?.city,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} isBlurBg={true} fixed onClose={() => closeModal()}>
      <FlexColStart className="w-full max-h-[600px] min-w-[400px] h-full bg-white-300 rounded-[22px] p-1">
        <FlexColStart className="w-full h-auto bg-white-100 rounded-[20px] relative">
          <button
            className="w-[30px] h-[30px] rounded-full border-none outline-none flex flex-col items-center justify-center absolute top-3 right-3 bg-white-400/20 scale-[.85] active:scale-[.95] transition-all enableBounceEffect"
            onClick={() => {
              closeModal();
              setOtpRequested(false);
            }}
          >
            <X size={15} color="#000" />
          </button>

          <FlexRowStart className="w-full px-4 py-5 border-b-[1px] border-dashed border-b-white-400/20 ">
            <FlexColCenter className="w-auto border-[2px] bg-dark-100 rounded-full p-1 relative">
              <LockOpen size={20} className="stroke-white-100 p-1" />
            </FlexColCenter>

            <FlexColStart className="w-full gap-1">
              <h1 className="font-ppM font-bold text-lg">Sign In</h1>
              <p className="text-xs font-ppReg font-light text-gray-500">
                Sign in to your chatbot account.
              </p>
            </FlexColStart>
          </FlexRowStart>

          <FlexColStart className="w-full h-auto gap-4 px-6 pb-6">
            {!otpRequested ? (
              <>
                <Input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border-[1px] border-white-400 rounded-md bg-white-300/20 text-xs font-ppReg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            ) : (
              <VerifyOTP
                verify={(otp) => {
                  verifyEmailMut.mutate({
                    email,
                    otp,
                  });
                }}
                resendOtp={() => {
                  signInMut.mutate({ email });
                }}
                loading={signInMut.isPending}
                disabled={verifyEmailMut.isPending}
              />
            )}
            {!otpRequested && (
              <Button
                intent={"dark"}
                className="w-full px-4 py-3 bg-dark-100 rounded-md text-xs font-ppReg text-white-100 enableBounceEffect hover:bg-brown-100"
                disabled={signInMut.isPending}
                isLoading={signInMut.isPending}
                onClick={handleSignin}
              >
                Sign In
              </Button>
            )}
            <FlexRowCenter className="w-full">
              <p className="text-center text-xs text-white-400 font-ppReg">
                Don't have an account?{" "}
                <button
                  className="font-ppM text-dark-100 underline"
                  onClick={() => switchTab("signup")}
                >
                  Sign-up
                </button>
              </p>
            </FlexRowCenter>
          </FlexColStart>
        </FlexColStart>
      </FlexColStart>
    </Modal>
  );
}

interface VerifyOTPProps {
  verify: (otp: string) => void;
  disabled?: boolean;
  loading?: boolean;
  resendOtp: () => void;
}

function VerifyOTP({ verify, disabled, loading, resendOtp }: VerifyOTPProps) {
  const otp = useRef<string>("");

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
          otp.current = v;
          verify(v);
        }}
        inputMode={"numeric"}
        disabled={disabled}
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
      <br />
      <FlexRowStartBtw className="w-full gap-2">
        <p className="text-xs font-ppReg text-white-400">
          Didn't receive the OTP?
        </p>

        <FlexRowEnd className="w-auto">
          <button
            className="text-dark-100 text-xs font-ppReg underline flex-center gap-2 disabled:opacity-[.5] disabled:cursor-not-allowed enableBounceEffect"
            onClick={() => {
              resendOtp();
            }}
            disabled={loading}
          >
            {loading && <Spinner size={15} color="#000" />}
            Resend OTP
          </button>
        </FlexRowEnd>
      </FlexRowStartBtw>
    </FlexColStartCenter>
  );
}
