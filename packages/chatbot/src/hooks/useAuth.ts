import { useDataCtx } from "@/context/DataCtx";
import { getAccountInfo } from "@/http/requests";
import type { AccountInfo } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

type Status = "authenticated" | "unauthorised";

export default function useAuth() {
  const { agent_id, account, setAccount } = useDataCtx();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const userMutation = useMutation({
    mutationFn: async (id: string) => await getAccountInfo(id),
    onSuccess: (data) => {
      const reqData = data?.data as AccountInfo;
      if (reqData) {
        setUser(reqData);
        setAccount(reqData);
      }
      setLoading(false);
      setStatus("authenticated");
    },
    onError: (err) => {
      setLoading(false);
      setStatus("unauthorised");

      console.error(err);
      throw new Error("Unauthorised");
    },
  });

  const fetchUser = useCallback(() => {
    if (agent_id && !account && !user) {
      setLoading(true);
      userMutation.mutate(agent_id);
    }
  }, [agent_id, account, user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    status,
    loading,
    user,
    refetch: fetchUser,
  };
}
