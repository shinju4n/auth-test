import { LoginRequestDto, LoginResponseDto } from "./login.dto";

export const login = async (
  loginRequestDto: LoginRequestDto
): Promise<LoginResponseDto> => {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginRequestDto),
    });

    const data = await response.json();

    if (!response.ok) {
      // 401, 400, 500 등 에러 상태
      throw new Error(data.error || "Login failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
};
