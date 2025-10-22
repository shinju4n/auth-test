import { test, expect } from "@playwright/test";

test.describe("로그인 플로우", () => {
  test("성공적으로 로그인하고 홈 페이지로 리다이렉트되어야 함", async ({
    page,
  }) => {
    // 1. 로그인 페이지로 이동
    await page.goto("/login");

    // 2. 페이지 제목 확인
    await expect(page).toHaveTitle("Create Next App");

    // 3. 이메일 입력
    await page.fill('input[type="text"]', "test@test.com");

    // 4. 비밀번호 입력
    await page.fill('input[type="password"]', "password123");

    // 5. 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 6. 홈 페이지로 리다이렉트 확인
    await page.waitForURL("/", { timeout: 5000 });
    expect(page.url()).toBe("http://localhost:3000/");

    // 7. (선택) 홈 페이지에서 링크가 보이는지 확인
    const loginLink = page.getByRole("link", { name: /로그인 페이지/i });
    const protectedLink = page.getByRole("link", {
      name: /인증 보호 페이지/i,
    });

    await expect(loginLink).toBeVisible();
    await expect(protectedLink).toBeVisible();
  });

  test("잘못된 비밀번호로 로그인 실패", async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto("/login");

    // 2. 이메일 입력
    await page.fill('input[type="text"]', "test@test.com");

    // 3. 잘못된 비밀번호 입력
    await page.fill('input[type="password"]', "wrongpassword");

    // 4. 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 5. 에러 알림 확인
    // alert 창이 나타나면 확인
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toContain("Invalid email or password");
      dialog.accept();
    });

    // 6. 로그인 페이지에 그대로 있어야 함
    await page.waitForTimeout(1000); // 알림 처리 시간
    expect(page.url()).toContain("/login");
  });
});
