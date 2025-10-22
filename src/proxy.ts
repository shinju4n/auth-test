import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// 인증이 필요한 경로들
const protectedRoutes = ["/protected"];

// 인증된 사용자가 접근하면 안되는 경로들
const authRoutes = ["/login"];

// 경로가 보호된 경로인지 확인
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

// 경로가 인증 경로인지 확인
function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  // 쿠키에서 토큰 확인
  const token = cookieStore.get("accessToken")?.value;

  const isAuthenticated = !!token;

  // 보호된 경로에 대한 인증 체크
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const redirectUrl = encodeURIComponent(pathname + request.nextUrl.search);
      return NextResponse.redirect(
        new URL(`/login?redirectUrl=${redirectUrl}`, request.url)
      );
    }
  }

  // 인증된 사용자가 로그인/회원가입 페이지 접근시 홈으로 리다이렉트
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외한 모든 요청에 대해 실행:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
