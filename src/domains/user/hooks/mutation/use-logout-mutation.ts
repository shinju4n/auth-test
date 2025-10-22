import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "@/domains/user/api/auth.api";

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: logoutApi,
  });
};
