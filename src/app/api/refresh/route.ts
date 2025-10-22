import { NextResponse, NextRequest } from "next/server";
import {
  verifyRefreshToken,
  generateAccessToken,
  isRefreshTokenValid,
  type TokenPayload,
} from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }

    // 메모리에 저장된 토큰인지 확인 (로그아웃됐는지 체크)
    if (!isRefreshTokenValid(refreshToken)) {
      return NextResponse.json(
        { error: "Refresh token has been revoked" },
        { status: 401 }
      );
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    // 새로운 access token 생성
    const newAccessToken = generateAccessToken(payload as TokenPayload);

    const response = NextResponse.json(
      {
        message: "Access token refreshed",
        user: payload,
      },
      { status: 200 }
    );

    // 새로운 access token을 쿠키에 저장
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15분
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
