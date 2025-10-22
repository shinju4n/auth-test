import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "./mutation/use-login-mutation";
import { useAuthStore } from "@/domains/user/store/use-auth-store";

export const useLogin = () => {
  const router = useRouter();
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("password123");
  const loginMutation = useLoginMutation();
  const setUser = useAuthStore((state) => state.setUser);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          console.log("data", data);
          setUser(data.user);
          router.push("/");
        },
        onError: (error) => {
          alert(error.message);
        },
      }
    );
  };

  return {
    email,
    password,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
  };
};
