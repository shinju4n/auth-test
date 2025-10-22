import { LoginRequestDto, LoginResponseDto } from "./login.dto";

export const login = async (
  loginRequestDto: LoginRequestDto
): Promise<LoginResponseDto> => {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginRequestDto),
  });

  const data = await response.json();

  // HTTP 상태 코드 확인
  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
};
