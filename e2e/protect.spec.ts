import { test, expect } from "@playwright/test";

test.describe("인증 페이지 검증 테스트", () => {
  test("로그아웃 후 인증 페이지에 접근할 수 없어야 함", async ({ page }) => {
    // 1단계: 인증 페이지 접근하면 로그인 페이지로 리다이렉트되어야 함
    await page.goto("/protected");
    await page.waitForURL("/login?redirectUrl=%2Fprotected", { timeout: 5000 });
    expect(page.url()).toContain("/login?redirectUrl=%2Fprotected");

    // 2단계: 로그인
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000); // 로그인 처리 시간
    await page.waitForURL("/protected", { timeout: 5000 });
    expect(page.url()).toContain("/protected");

    // 3단계: 홈 페이지 로드 확인
    await page.goto("/", { timeout: 5000 });
    expect(page.url()).toContain("/");

    // 4단계: 로그아웃
    const logoutButton = page.getByRole("button", { name: /로그아웃/i });
    await logoutButton.click();
    await page.waitForTimeout(5000); // 로그아웃 처리 시간

    // 4단계: 인증 페이지 접근 확인
    await page.goto("/protected");
    await page.waitForURL("/login?redirectUrl=%2Fprotected", { timeout: 5000 });
    expect(page.url()).toContain("/login?redirectUrl=%2Fprotected");
  });

  test("로그인 후 인증 페이지에 접근할 수 있어야 함", async ({ page }) => {
    // 1단계: 로그인
    await page.goto("/login");
    await page.fill('input[type="text"]', "test@test.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // 2단계: 홈 페이지 로드 확인
    await page.waitForURL("/", { timeout: 5000 });
    expect(page.url()).toContain("/");

    // 3단계: 인증페이지 접근
    await page.goto("/protected");

    // 4단계: 인증 페이지 접근 확인
    await expect(page).toHaveURL("/protected");

    // 5단계: 인증페이지에서 새로고침
    await page.reload();
    await page.waitForURL("/protected", { timeout: 5000 });
    expect(page.url()).toContain("/protected");
  });
});
