import { getAccountInfo } from "@/http/requests";
import type { AccountInfo } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Status = "authenticated" | "unauthorised";

export default function useAuth() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status | null>(null);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const userMutation = useMutation({
    mutationFn: async () => await getAccountInfo(),
    onError: (err) => {
      setLoading(false);
      setStatus("unauthorised");

      console.error(err);
      throw new Error("Unauthorised");
    },
    onSuccess: (data) => {
      const reqData = data?.data as AccountInfo;
      if (reqData) setUser(reqData);
      setLoading(false);
      setStatus("authenticated");
    },
  });

  useEffect(() => {
    if (status === "authenticated" || user) return;

    if (!loading || status === "unauthorised" || !status) {
      fetcher();
    }
  }, []);

  const fetcher = async () => {
    setLoading(true);
    userMutation.mutate();
  };

  return {
    status,
    loading,
    user,
    refetch: fetcher,
  };
}
