import { NextResponse } from "next/server";
import {
  generateAccessToken,
  generateRefreshToken,
  addRefreshToken,
  type TokenPayload,
} from "@/lib/auth";
import { User } from "@/domains/user/types/user.type";

// 테스트용 임시 사용자 데이터
const TEST_USER = {
  id: "user-1",
  email: "test@test.com",
  password: "password123",
  name: "Test User",
};

export const POST = async (req: Request) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (email === TEST_USER.email && password === TEST_USER.password) {
      const payload: TokenPayload = {
        id: TEST_USER.id,
        email: TEST_USER.email,
        name: TEST_USER.name,
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // refresh token 메모리에 저장
      addRefreshToken(refreshToken);

      const response: NextResponse<{ message: string; user: User }> =
        NextResponse.json(
          {
            message: "Login successful",
            user: {
              id: TEST_USER.id,
              email: TEST_USER.email,
              name: TEST_USER.name,
            },
          },
          { status: 200 }
        );

      // 쿠키에 토큰 저장
      response.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60, // 15분
      });

      response.cookies.set("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7일
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
