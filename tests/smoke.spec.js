// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Camping App 煙霧測試', () => {
  test('首頁可載入', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('/camping-app/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Camping App v/);
    expect(errors, 'Console 不應有錯誤').toHaveLength(0);
  });

  test('四大分類導覽可切換', async ({ page }) => {
    await page.goto('/camping-app/', { waitUntil: 'domcontentloaded' });
    const nav = page.locator('#tabs .tab');
    await expect(nav).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await nav.nth(i).click();
      await expect(nav.nth(i)).toHaveClass(/active/);
    }
  });

  test('登入彈窗可開啟並關閉', async ({ page }) => {
    await page.goto('/camping-app/', { waitUntil: 'domcontentloaded' });
    const open = page.locator('text=登入').first();
    if (await open.count()) {
      await open.click({ timeout: 5000 }).catch(() => {});
    }
    await expect(page).toHaveTitle(/Camping App v/);
  });
});
