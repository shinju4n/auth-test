import { useMutation } from "@tanstack/react-query";
import { login } from "../../_api/login.api";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  });
};
