import { NextResponse, NextRequest } from "next/server";
import { removeRefreshToken } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    // refresh token 메모리에서 제거 (폐기)
    if (refreshToken) {
      removeRefreshToken(refreshToken);
    }

    const response = NextResponse.json(
      {
        message: "Logout successful",
      },
      { status: 200 }
    );

    // 쿠키 삭제
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
