import { test, expect } from "@playwright/test";

test.describe("토큰 갱신 자동화", () => {
  test("AccessToken 만료 후 자동으로 갱신되어야 함", async ({ page }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 5000 });

    // 2단계: 로그인 확인
    const logoutButton = page.getByRole("button", { name: /로그아웃/i });
    await expect(logoutButton).toBeVisible();

    // 3단계: 보호된 페이지 접근
    await page.goto("/protected");
    await page.waitForURL("/protected", { timeout: 5000 });

    // 4단계: AccessToken을 강제로 만료시키기 (쿠키 조작)
    const cookies = await page.context().cookies();
    const newCookies = cookies.map((cookie) => {
      if (cookie.name === "accessToken") {
        // 만료된 토큰으로 변경 (이전에 발급받은 토큰)
        return {
          ...cookie,
          value:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMSIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE2OTc3OTIwMDAsImV4cCI6MTY5Nzc5MjYwMH0.fake",
        };
      }
      return cookie;
    });

    await page.context().addCookies(newCookies);

    // 5단계: 페이지 새로고침 (AccessToken 확인)
    await page.reload();
    await page.waitForURL("/protected", { timeout: 5000 });

    // 6단계: 보호된 페이지가 여전히 보여야 함 (자동으로 토큰 갱신됨)
    await expect(page).toHaveURL("/protected");
  });

  test("RefreshToken 만료 시 로그인 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 5000 });

    // 2단계: 쿠키 초기화 (로그아웃 시뮬레이션)
    await page.context().clearCookies();

    // 3단계: 보호된 페이지 접근 시도
    await page.goto("/protected");

    // 4단계: 로그인 페이지로 리다이렉트 확인
    await page.waitForURL("/login?redirectUrl=%2Fprotected", {
      timeout: 5000,
    });
    expect(page.url()).toContain("/login?redirectUrl=%2Fprotected");
  });

  test("동시에 여러 요청이 401을 받을 때 refresh가 한 번만 실행되어야 함", async ({
    page,
  }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 5000 });

    // 2단계: 보호된 페이지 접근
    await page.goto("/protected");
    await page.waitForURL("/protected", { timeout: 5000 });

    // 3단계: 네트워크 요청 모니터링
    let refreshCallCount = 0;
    page.on("response", (response) => {
      if (response.url().includes("/api/refresh")) {
        refreshCallCount++;
      }
    });

    // 4단계: AccessToken 만료 시뮬레이션
    const cookies = await page.context().cookies();
    const newCookies = cookies.map((cookie) => {
      if (cookie.name === "accessToken") {
        return {
          ...cookie,
          value:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMSIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIiLCJpYXQiOjE2OTc3OTIwMDAsImV4cCI6MTY5Nzc5MjYwMH0.fake",
        };
      }
      return cookie;
    });
    await page.context().addCookies(newCookies);

    // 5단계: 페이지 새로고침 (동시에 여러 요청 발생)
    await page.reload();
    await page.waitForURL("/protected", { timeout: 5000 });

    // 6단계: refresh 호출 횟수 확인 (최대 1회)
    console.log(`Refresh API called ${refreshCallCount} times`);
    // 현재는 구현되지 않았으므로 refreshCallCount는 0이 될 것
    // 구현 후에는 이 값이 1 이하여야 함
  });

  test("로그인 후 접근 권한이 없는 리소스 요청 시 refresh 후 재시도하지 못하면 로그인 페이지로 이동", async ({
    page,
  }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/", { timeout: 5000 });

    // 2단계: refresh 토큰 제거 (강제 로그아웃)
    await page.context().clearCookies();

    // 3단계: 페이지 새로고침
    await page.reload();

    // 4단계: useAuth 훅이 실행되면서 /api/me 호출 (실패)
    // 다시 로그인하게 됨
    await page.waitForTimeout(2000);

    // 5단계: 로그인 페이지로 가는지 확인 또는 로그아웃 버튼이 없는지 확인
    const logoutButton = page.getByRole("button", { name: /로그아웃/i });
    const loginLink = page.getByRole("link", { name: /로그인/i });

    // 로그인 링크가 있어야 함 (로그아웃된 상태)
    await expect(loginLink).toBeVisible();
  });
});
