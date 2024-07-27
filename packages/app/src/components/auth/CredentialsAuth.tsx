"use client";
import { FlexColStart, FlexRowCenter, FlexRowStart } from "@/components/Flex";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, signInUser } from "@/http/requests";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "@/components/icons";
import useSession from "@/hooks/useSession";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import type { ResponseData } from "@/types";

function CredentialsAuth() {
  const [activeTab, setActiveTab] = React.useState<"signin" | "otp-input">(
    "signin"
  );
  const { status, loading } = useSession();
  const [form, setForm] = React.useState({
    email: "",
    otp_code: "",
  });

  if (loading) return null;

  if (status === "authenticated") {
    window.location.href = "/dashboard";
  }

  return (
    <FlexColStart className="w-full dark:bg-transparent ">
      <FlexRowCenter className="w-full grid grid-cols-3">
        <span className="p-[.5px] w-full bg-white-400/30"></span>
        <span className="text-white-400 w-full text-center text-[12px] font-ppReg">
          Sign-in
        </span>
        <span className="p-[.5px] w-full bg-white-400/30"></span>
      </FlexRowCenter>
      {activeTab === "otp-input" && (
        <FlexRowStart className="w-auto">
          <button
            className="text-xs text-white-100/50"
            onClick={() => setActiveTab("signin")}
          >
            <FlexRowCenter className="w-auto">
              <ChevronLeft size={13} /> Back
            </FlexRowCenter>
          </button>
        </FlexRowStart>
      )}

      {activeTab === "signin" ? (
        <SignInComp
          setForm={setForm as any}
          next={() => setActiveTab("otp-input")}
          form={form}
        />
      ) : (
        <OtpComp form={form} setForm={setForm as any} />
      )}

      <FlexRowStart className="w-full gap-1 pb-6">{null}</FlexRowStart>
    </FlexColStart>
  );
}

export default CredentialsAuth;

type SignInCompProps = {
  form: {
    email: string;
    otp_code?: string;
  };
  setForm: React.Dispatch<React.SetStateAction<{ email: string }>>;
  next: () => void;
};

function SignInComp({ form, setForm, next }: SignInCompProps) {
  const sendOtpMut = useMutation({
    mutationFn: async (data: any) => await signInUser(data),
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetMutation = () => {
    sendOtpMut.reset();
  };

  useEffect(() => {
    if (sendOtpMut.error) {
      resetMutation();
      const error = (sendOtpMut.error as any)?.response?.data as ResponseData;
      toast.error(error?.message);
    }
    if (sendOtpMut.data) {
      resetMutation();

      // call the next function if it exists
      next && next();
      toast.success("OTP sent successfully. Check your email.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendOtpMut.error, sendOtpMut.data, sendOtpMut.isPending]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { email } = form;

    if (!email) {
      toast.error("Email is required");
      return;
    }

    sendOtpMut.mutate(form);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <FlexColStart className="w-full relative py-4">
        <FlexColStart className="w-full">
          <label className="text-white-400 font-ppReg text-[12px] ">
            Email
          </label>
          <Input
            name="email"
            placeholder="Email"
            className="bg-white-300 dark:bg-transparent dark:border-blue-101 dark:border-[1px] dark:text-white-100 placeholder:text-white-400 text-dark-200 font-jbSB border-solid border-[.5px] border-white-400 px-5 "
            onChange={handleFormChange}
            value={form.email}
          />
        </FlexColStart>
        <FlexColStart className="w-full">
          {/* @ts-no-error */}
          <Button
            intent={"dark"}
            className="w-full dark:bg-blue-101 dark:hover:bg-blue-101/80 dark:mt-5 "
            onClick={handleSubmit as any}
            isLoading={sendOtpMut.isPending}
          >
            <span className="font-ppReg text-white-100 text-[13px] ">
              Sign-in
            </span>
          </Button>
        </FlexColStart>
      </FlexColStart>
    </form>
  );
}

type OtpCompProps = {
  form: {
    otp_code: string;
    email?: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{ otp_code: string; email?: string }>
  >;
};

function OtpComp({ form, setForm }: OtpCompProps) {
  const [loading, setLoading] = React.useState(false);
  const loginMut = useMutation({
    mutationFn: async (data: any) => await login(data),
    onSuccess: () => {
      setLoading(false);
      window.location.href = "/editor";
    },
    onError: (err) => {
      setLoading(false);
      toast.error(err?.message ?? "An error occurred");
    },
  });

  const resetMutation = () => {
    loginMut.reset();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loginMut.isError) resetMutation();
    if (e.target.value.length > 6) return;
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    loginMut.mutate(form);
  };

  return (
    <form className="w-full" onSubmit={handleFormSubmit}>
      <FlexColStart className="w-full relative py-4">
        <FlexColStart className="w-full">
          <label className="text-white-400 font-ppReg text-[12px] ">
            6 digits OTP Code
          </label>
          <Input
            name="otp_code"
            type="number"
            placeholder="5 4 3 2 1 0"
            className="bg-white-300 dark:bg-transparent dark:border-blue-101 dark:border-[1px] dark:text-white-100 placeholder:text-white-400 text-dark-200 font-jbSB border-solid border-[.5px] border-white-400 px-5 text-md font-ppB tracking-wider "
            onChange={handleFormChange}
            maxLength={6}
            value={form.otp_code}
          />
          <Button
            intent={"dark"}
            className="w-full dark:bg-blue-101 dark:hover:bg-blue-101/80 dark:mt-5"
            isLoading={loginMut.isPending || loading}
            onClick={handleFormSubmit}
          >
            <span className="font-ppReg font-semibold text-white-100 text-[13px] ">
              Continue
            </span>
          </Button>
        </FlexColStart>
      </FlexColStart>
    </form>
  );
}
