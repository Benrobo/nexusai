"use client";
import { FlexColCenter, FlexColStart } from "@/components/Flex";
import { withoutAuth } from "@/lib/auth-helpers/withoutAuth";
import { useLocation } from "react-router-dom";
import React from "react";
import toast from "react-hot-toast";
import OAuth from "@/components/auth/OAuth";

const errorCode = {
  google_auth_failed: "Google authentication failed.",
  email_not_found: "Email not found.",
  unauthenticated: "Unauthorised, please login.",
};

function AuthPage() {
  let searchParams = new URLSearchParams(useLocation().search).get("error");

  React.useEffect(() => {
    if (searchParams) {
      // @ts-ignore
      toast.error(errorCode[searchParams]);
    }
  }, [searchParams]);

  console.log(searchParams);

  return (
    <FlexColCenter className="w-full h-screen">
      <FlexColStart className="w-full min-w-[350px] max-w-[500px] scale-[.90] md:scale-[1] ">
        {/* Replace your prefer auth component */}
        <OAuth />
      </FlexColStart>
    </FlexColCenter>
  );
}

// prevent user to access this page if they are already logged in
export default withoutAuth(AuthPage);
// export default AuthPage;
