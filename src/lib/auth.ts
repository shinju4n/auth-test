import jwt from "jsonwebtoken";

const SECRET_KEY = "test-secret-key";
const REFRESH_SECRET_KEY = "test-refresh-secret-key";

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export const generateAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET_KEY) as TokenPayload;
  } catch {
    return null;
  }
};

// 메모리에 발급된 refresh token 저장 (로그아웃 구현용)
const refreshTokenStore = new Set<string>();

export const addRefreshToken = (token: string) => {
  refreshTokenStore.add(token);
};

export const removeRefreshToken = (token: string) => {
  refreshTokenStore.delete(token);
};

export const isRefreshTokenValid = (token: string) => {
  return refreshTokenStore.has(token);
};
