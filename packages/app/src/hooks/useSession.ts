import { getUser } from "@/http/requests";
import type { UserInfo } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

type Status = "authenticated" | "unauthorised";

export default function useSession() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const userMutation = useMutation({
    mutationFn: async () => await getUser(),
    onError: (err) => {
      setLoading(false);
      setStatus("unauthorised");

      console.error(err);
      throw new Error("Unauthorised");
    },
    onSuccess: (data) => {
      const reqData = data?.data as UserInfo;
      if (reqData) setUser(reqData);
      setLoading(false);
      setStatus("authenticated");
    },
  });

  const fetchUser = useCallback(() => {
    if (!user) {
      setLoading(true);
      userMutation.mutate();
    }
  }, [user]);

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    status,
    loading,
    user,
    refetch: fetchUser,
  };
}
