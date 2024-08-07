import { FlexColCenter, FlexColStart, FlexRowCenter } from "@/components/Flex";
import { LockOpen, Trash } from "@/components/icons";
import ProtectPage from "@/components/ProtectPage";
import Button from "@/components/ui/button";
import WIDGET_CONFIG from "@/config/widget";
import { useDataCtx } from "@/context/DataCtx";
import { deleteAccount, logoutAccount } from "@/http/requests";
import { capitalizeFirstChar, sendMessageToParentIframe } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

function Account() {
  const { account } = useDataCtx();
  const logoutMut = useMutation({
    mutationFn: async () => await logoutAccount(),
    onSuccess: () => {
      console.log("Logged out");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
    },
  });

  const deleteAccountMut = useMutation({
    mutationFn: async () => await deleteAccount(),
    onSuccess: async () => {
      toast.success("Account deleted successfully");
      sendMessageToParentIframe({
        type: "reload-frame",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "An error occurred";
      toast.error(msg);
    },
  });

  return (
    <FlexColCenter className="w-full h-auto min-h-[70%] py-10">
      <img
        src={`https://api.dicebear.com/9.x/initials/svg?seed=${account?.name}`}
        width={80}
        className="rounded-full"
      />
      {/* chatwidget user account details */}
      <FlexColCenter className="gap-1 text-center px-6 ">
        <h1 className="font-ppB text-md text-dark-100">
          {capitalizeFirstChar(account?.name!)}
        </h1>
        <p className="font-ppReg text-sm text-white-400">{account?.email}</p>
      </FlexColCenter>

      <FlexRowCenter className="w-full px-[2em] mt-10">
        <Button
          className="w-full px-10 rounded-xl bg-white-300/30 text-xs text-dark-100 border-[.5px] border-white-400/30 hover:bg-white-400/20 enableBounceEffect font-ppM disabled:bg-white-400/40 disabled:opacity-[.8] disabled:cursor-not-allowed"
          onClick={() => {
            logoutMut.mutate();
            sendMessageToParentIframe({
              type: "logout",
              payload: {
                cookie_name: WIDGET_CONFIG.cookie_name,
              },
            });
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
          <Button
            className="w-full px-10 rounded-xl bg-red-305/80 text-xs text-white-100  hover:bg-red-305 enableBounceEffect font-ppM"
            onClick={() => {
              const confirm = window.confirm(
                "Are you sure you want to delete your account? This action is irreversible."
              );
              if (confirm) {
                deleteAccountMut.mutate();
              }
            }}
            isLoading={deleteAccountMut.isPending}
            disabled={deleteAccountMut.isPending}
          >
            <Trash size={15} className="stroke-white-100" />
            <span>Delete Account</span>
          </Button>
        </FlexColStart>
      </FlexColCenter>
    </FlexColCenter>
  );
}

export default ProtectPage(Account);
