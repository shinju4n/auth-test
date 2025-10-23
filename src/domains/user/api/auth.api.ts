import { httpJson } from "@/lib/http";
import { AuthResponseDto } from "./auth.dto";

export const getMe = async (): Promise<AuthResponseDto> => {
  return httpJson<AuthResponseDto>("/api/me");
};

export const logoutApi = async (): Promise<void> => {
  await httpJson<{ message: string }>("/api/logout", {
    method: "POST",
  });
};
