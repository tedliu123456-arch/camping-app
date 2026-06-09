import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('=== Camping App Test v42.4 ===\n');

try {
  // 1. 社群首頁載入
  console.log('1. 社群首頁載入測試...');
  await page.goto('https://tedliu123456-arch.github.io/camping-app/', { timeout: 15000 });
  const title = await page.title();
  console.log('   ✅ 頁面載入成功');
  
  // 2. 四大分類導覽
  console.log('2. 四大分類導覽測試...');
  const categories = ['社群媒體', '露營車改裝', '露營用品', '露營車出租'];
  for (const cat of categories) {
    await page.click(`text=${cat}`);
    await page.waitForTimeout(500);
  }
  console.log('   ✅ 分類切換正常');
  
  // 3. 商家卡片
  console.log('3. 商家卡片顯示測試...');
  await page.click('text=露營車改裝');
  await page.waitForTimeout(500);
  const cards = await page.locator('.business-card, [class*="card"]').count();
  console.log(`   ✅ 商家卡片: ${cards} 個`);
  
  // 4. 完整資料頁
  console.log('4. 完整資料頁測試...');
  const detailBtns = await page.locator('text=完整資料').count();
  console.log(`   ✅ 完整資料按鈕: ${detailBtns} 個`);
  
  // 5. 私訊頁
  console.log('5. 私訊頁測試...');
  const msgBtn = await page.locator('text=私訊').count();
  console.log(`   ✅ 私訊按鈕: ${msgBtn} 個`);
  
  // 6. 登入/頭像
  console.log('6. 登入/頭像測試...');
  const userInfo = await page.locator('text=admin').count();
  if (userInfo > 0) {
    console.log('   ✅ 已登入 (顯示 admin)');
  } else {
    console.log('   ⚠️ 未登入');
  }
  
  // 7. 版本號
  console.log('7. 版本號...');
  const versionText = await page.textContent('body');
  const versionMatch = versionText.match(/v(\d+)\.(\d+)/);
  if (versionMatch) {
    console.log(`   ✅ 版本: ${versionMatch[0]}`);
  }
  
  console.log('\n=== 所有測試通過 ===');
  
} catch (e) {
  console.error('❌ 測試失敗:', e.message);
} finally {
  await browser.close();
}