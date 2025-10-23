import { httpJson } from "@/lib/http";
import { LoginRequestDto, LoginResponseDto } from "./login.dto";

export const login = async (
  loginRequestDto: LoginRequestDto
): Promise<LoginResponseDto> => {
  return httpJson<LoginResponseDto>("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginRequestDto),
  });
};
