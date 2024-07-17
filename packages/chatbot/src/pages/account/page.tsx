import {
  FlexColCenter,
  FlexColStart,
  FlexRowCenter,
  FlexRowCenterBtw,
} from "@/components/Flex";
import { LockOpen, Trash, User } from "@/components/icons";
import { FullPageLoader } from "@/components/Loader";
import ProtectPage from "@/components/ProtectPage";
import Button from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import { logoutAccount } from "@/http/requests";
import { capitalizeFirstChar } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

function Account() {
  const { loading, user } = useAuth();
  const logoutMut = useMutation({
    mutationFn: async () => await logoutAccount(),
    onSuccess: () => {
      window?.location.reload();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
    },
  });

  if (loading) return <FullPageLoader showText={false} />;

  return (
    <FlexColCenter className="w-full h-auto py-10">
      <h1 className="font-ppM text-md text-dark-100">Account Details</h1>

      <br />
      <br />

      <img
        src={`https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`}
        width={80}
        className="rounded-full"
      />
      {/* chatwidget user account details */}
      <FlexColCenter className="gap-1 text-center px-6 ">
        <h1 className="font-ppB text-md text-dark-100">
          {capitalizeFirstChar(user?.name!)}
        </h1>
        <p className="font-ppReg text-sm text-white-400">{user?.email}</p>
      </FlexColCenter>

      <FlexRowCenter className="w-full px-[2em] mt-10">
        <Button
          className="w-full px-10 rounded-xl bg-white-300/30 text-xs text-dark-100 border-[.5px] border-white-400/30 hover:bg-white-400/20 enableBounceEffect font-ppM disabled:bg-white-400/40 disabled:opacity-[.8] disabled:cursor-not-allowed"
          onClick={() => {
            logoutMut.mutate();
          }}
          isLoading={logoutMut.isPending}
          disabled={logoutMut.isPending}
        >
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
