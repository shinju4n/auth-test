import { useMutation } from "@tanstack/react-query";
import { login } from "../../api/login.api";

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: login,
  });
};
