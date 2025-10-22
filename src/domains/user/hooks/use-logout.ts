import { useQueryClient } from "@tanstack/react-query";
import { useLogoutMutation } from "./mutation/use-logout-mutation";
import { useAuthStore } from "../store/use-auth-store";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const logoutMutation = useLogoutMutation();
  const { clearAuth } = useAuthStore();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        queryClient.clear();
        clearAuth();
      },
    });
  };

  return {
    logoutMutation,
    handleLogout,
  };
};
