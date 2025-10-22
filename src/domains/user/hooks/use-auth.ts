import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/domains/user/store/use-auth-store";
import { getMe } from "../api/auth.api";
import { useEffect } from "react";

export const useAuth = () => {
  const { user, setUser, clearAuth } = useAuthStore();

  const { data, error, isSuccess, isError, isPending } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const response = await getMe();
      return response;
    },
    enabled: !user, // 유저 정보 없을 때만 실행
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data.user);
    }
  }, [isSuccess, data, setUser]);

  useEffect(() => {
    if (isError) {
      clearAuth();
    }
  }, [isError, clearAuth]);

  return {
    user: user,
    isLoading: isPending,
    isAuthenticated: !!user,
    error,
  };
};
