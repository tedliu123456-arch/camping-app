const { test, expect } = require('@playwright/test');

test('hourly smoke: login + social + contest', async ({ page }) => {
  await page.goto('/');

  await page.fill('#loginAccount', 'tester01');
  await page.fill('#loginPassword', '123456');
  await page.click('button:has-text("登入")');

  await expect(page.locator('#appShell')).toBeVisible();
  await expect(page.locator('#socialNav')).toBeVisible();

  // 社群首頁要看得到比賽 banner
  await expect(page.locator('#contestBanner')).toBeVisible();

  // 比賽視窗開啟 + 可見投票項目
  await page.click('#contestBanner .contest-join');
  await expect(page.locator('#contestModal')).toBeVisible();
  await expect(page.locator('#contestEntriesList .contest-round-item').first()).toBeVisible();

  // 發文流程（使用右下角 +貼文）
  await page.click('#fabPost');
  await expect(page.locator('#postPageOverlay')).toBeVisible();
  await page.fill('#postText', `hourly smoke ${Date.now()}`);
  await page.click('button:has-text("發佈貼文")');

  // 發文後應回到內容並看得到貼文列表
  await expect(page.locator('#feed .list-item').first()).toBeVisible();
});

test('hourly smoke: category tabs hide contest banner', async ({ page }) => {
  await page.goto('/');
  await page.fill('#loginAccount', 'tester01');
  await page.fill('#loginPassword', '123456');
  await page.click('button:has-text("登入")');

  await page.click('#socialNav button:has-text("露營區")');
  await expect(page.locator('#contestBanner')).toBeHidden();

  await page.click('#socialNav button:has-text("露營用品")');
  await expect(page.locator('#contestBanner')).toBeHidden();

  await page.click('#socialNav button:has-text("社群媒體")');
  await expect(page.locator('#contestBanner')).toBeVisible();
});
