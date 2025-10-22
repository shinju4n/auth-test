import { AuthResponseDto } from "./auth.dto";

export const getMe = async (): Promise<AuthResponseDto> => {
  try {
    const response = await fetch("/api/me");
    return response.json();
  } catch (error) {
    throw error;
  }
};

export const logoutApi = async (): Promise<void> => {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
    });
    return response.json();
  } catch (error) {
    throw error;
  }
};
