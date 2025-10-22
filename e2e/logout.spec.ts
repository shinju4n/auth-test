import { test, expect } from "@playwright/test";

test.describe("로그아웃 플로우", () => {
  test("로그인 후 로그아웃할 수 있어야 함", async ({ page }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // 2단계: 홈 페이지 로드 확인
    await page.waitForURL("/", { timeout: 5000 });
    expect(page.url()).toContain("/");

    // 3단계: 로그인 상태 확인
    // "로그인 되었습니다" 메시지 보임
    const loginStatusMessage = page.getByText(/로그인 되었습니다/);
    await expect(loginStatusMessage).toBeVisible();

    // "로그인 페이지" 링크는 숨겨짐
    const loginPageLink = page.getByRole("link", { name: /로그인 페이지/i });
    await expect(loginPageLink).not.toBeVisible();

    // "로그아웃" 버튼은 보임
    const logoutButton = page.getByRole("button", { name: /로그아웃/i });
    await expect(logoutButton).toBeVisible();

    // 4단계: 로그아웃 버튼 클릭
    await logoutButton.click();

    // 5단계: 로그아웃 상태 확인
    // "로그인 되지 않았습니다" 메시지 보임
    const logoutStatusMessage = page.getByText(/로그인 되지 않았습니다/);
    await expect(logoutStatusMessage).toBeVisible({ timeout: 5000 });

    // "로그인 페이지" 링크는 다시 보임
    await expect(loginPageLink).toBeVisible();

    // "로그아웃" 버튼은 숨겨짐
    await expect(logoutButton).not.toBeVisible();
  });

  test("로그아웃 후 쿠키가 삭제되어야 함", async ({ page }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // 2단계: 홈 페이지 로드
    await page.waitForURL("/", { timeout: 5000 });

    // 3단계: 로그인 상태에서 쿠키 확인
    const cookies = await page.context().cookies();
    const accessTokenCookie = cookies.find((c) => c.name === "accessToken");
    const refreshTokenCookie = cookies.find((c) => c.name === "refreshToken");

    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();

    // 4단계: 로그아웃
    const logoutButton = page.getByRole("button", { name: /로그아웃/i });
    await logoutButton.click();

    // 5단계: 로그아웃 후 쿠키 확인
    await page.waitForTimeout(1000); // 쿠키 삭제 대기
    const cookiesAfterLogout = await page.context().cookies();
    const accessTokenCookieAfter = cookiesAfterLogout.find(
      (c) => c.name === "accessToken"
    );
    const refreshTokenCookieAfter = cookiesAfterLogout.find(
      (c) => c.name === "refreshToken"
    );

    // 쿠키가 삭제되어야 함
    expect(accessTokenCookieAfter).toBeUndefined();
    expect(refreshTokenCookieAfter).toBeUndefined();
  });

  test("로그아웃 후 /api/me 요청이 실패해야 함", async ({ page }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // 2단계: 홈 페이지 로드
    await page.waitForURL("/", { timeout: 5000 });

    // 3단계: 로그아웃
    const logoutButton = page.getByRole("button", { name: /로그아웃/i });
    await logoutButton.click();

    // 4단계: 로그아웃 상태 확인
    const logoutStatusMessage = page.getByText(/로그인 되지 않았습니다/);
    await expect(logoutStatusMessage).toBeVisible({ timeout: 5000 });

    // 5단계: /api/me 요청으로 사용자 정보를 가져올 수 없어야 함
    const response = await page.request.get("/api/me");
    expect(response.status()).toBe(401);
  });
});
