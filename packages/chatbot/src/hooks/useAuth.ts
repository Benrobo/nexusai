import { useDataCtx } from "@/context/DataCtx";
import { getAccountInfo } from "@/http/requests";
import type { AccountInfo } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Status = "authenticated" | "unauthorised";

export default function useAuth() {
  const { agent_id, account, setAccount } = useDataCtx();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const userMutation = useMutation({
    mutationFn: async (id: string) => await getAccountInfo(id),
    onSuccess: (data) => {
      const reqData = data?.data as AccountInfo;
      if (reqData) {
        setUser(reqData);
        setAccount && setAccount(reqData);
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

  useEffect(() => {
    if (agent_id && !account) {
      userMutation.mutate(agent_id);
    }
  }, [agent_id, account]);

  useEffect(() => {
    if (status === "authenticated" || user) return;

    if (!loading || status === "unauthorised" || !status) {
      fetcher();
    }
  }, []);

  const fetcher = async () => {
    setLoading(true);
    agent_id && userMutation.mutate(agent_id);
  };

  return {
    status,
    loading,
    user,
    refetch: fetcher,
  };
}
