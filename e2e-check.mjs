/**
 * 露營趣 Camping App — 自動化冒煙測試（完整清單）
 * 用法：node e2e-check.mjs [baseUrl]
 * 需求：playwright（已於 node_modules）
 */
import { chromium } from 'playwright';
process.on('unhandledRejection', (e) => { console.log('!! UNHANDLED REJECTION:', e && (e.stack||e.message||String(e))); });

const BASE = process.argv[2] || 'https://tedliu123456-arch.github.io/camping-app/';
const results = [];
const ok = (n, d = '') => results.push({ pass: true, n, d });
const bad = (n, d = '') => results.push({ pass: false, n, d });

const browser = await chromium.launch({ headless: true, channel: process.env.PW_CHANNEL || undefined });
const ctx = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'zh-TW',
});
const page = await ctx.newPage();

const consoleErrors = [];
const httpErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('dialog', async (d) => { await d.dismiss().catch(() => {}); });
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) httpErrors.push(`${r.status()} ${r.url()}`); });

try {
  // ---------- 1. 社群首頁載入 ----------
  await page.goto(BASE, { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.state && document.querySelectorAll('#feedList .feed-item').length > 0, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(1200);

  const version = await page.textContent('#appVersion').catch(() => null);
  version ? ok('社群首頁載入 + 版本顯示', `v${version}`) : bad('社群首頁載入 + 版本顯示', '拿不到版本');

  const feedCount = await page.locator('#feedList .feed-item').count();
  feedCount > 0 ? ok('社群首頁貼文渲染', `${feedCount} 則`) : bad('社群首頁貼文渲染', '0 則');

  const marquee = (await page.textContent('#announceMarquee').catch(() => '') || '').trim();
  marquee.length > 0 ? ok('活動跑馬燈', marquee.replace(/\s+/g, ' ').slice(0, 60)) : bad('活動跑馬燈', '空');

  // ---------- 2. 四大分類導覽 ----------
  const tabKeys = ['social', 'mod', 'gear', 'rental'];
  for (const key of tabKeys) {
    await page.evaluate((k) => window.setTab(k), key);
    await page.waitForTimeout(400);
    const r = await page.evaluate((k) => {
      const active = document.querySelector('.tab.active');
      const sec = document.getElementById('sec-' + k);
      const visible = sec ? getComputedStyle(sec).display !== 'none' : false;
      const visibleSections = Array.from(document.querySelectorAll('.section'))
        .filter((s) => getComputedStyle(s).display !== 'none').map((s) => s.id);
      const list = sec ? sec.querySelector('[id$="List"]') : null;
      return {
        active: active ? active.textContent.trim() : null,
        visible,
        visibleSections,
        cards: list ? list.querySelectorAll(':scope > *').length : -1,
      };
    }, key);
    const pass = r.active && r.visible && r.visibleSections.length === 1 && r.visibleSections[0] === 'sec-' + key;
    pass ? ok(`分類切換 ${key}`, `active=${r.active} cards=${r.cards}`) : bad(`分類切換 ${key}`, JSON.stringify(r));
  }

  // ---------- 3. 商家卡片 + 完整資料頁 ----------
  await page.evaluate(() => window.setTab('campsite'));
  await page.waitForTimeout(500);
  const card = page.locator('#campsiteList > *').first();
  const cardBtns = await card.locator('button').allTextContents().catch(() => []);
  const cardTitle = ((await card.textContent().catch(() => '')) || '').trim().split('\n')[0];
  cardBtns.length > 0 ? ok('商家卡片顯示', `${cardTitle} | ${cardBtns.join('/')}`) : bad('商家卡片顯示', '找不到卡片按鈕');

  await card.locator('button', { hasText: '完整資料' }).first().click();
  await page.waitForTimeout(800);
  const detailLen = await page.evaluate(() => (document.getElementById('storeDetailBody')?.innerText || '').length);
  const detailVisible = await page.evaluate(() => {
    const b = document.getElementById('storeDetailBody');
    return !!b && b.offsetHeight > 0;
  });
  (detailVisible && detailLen > 50) ? ok('商家完整資料頁', `${detailLen} 字`) : bad('商家完整資料頁', `visible=${detailVisible} len=${detailLen}`);
  await page.evaluate(() => window.closeStoreGallery?.());
  await page.waitForTimeout(300);

  // ---------- 4. 活動 / 比賽 ----------
  const evt = await page.evaluate(async () => {
    const out = {};
    const ann = document.querySelector('[onclick^="openAnnouncement"]');
    out.announceFound = !!ann;
    if (ann) {
      ann.click();
      await new Promise((r) => setTimeout(r, 600));
      const t = document.getElementById('announcementTitle');
      out.announceTitle = t?.textContent?.trim();
      out.announceOpen = !!t && t.offsetHeight > 0;
      window.closeAnnouncementModal?.();
    }
    const banner = document.getElementById('contestBanner');
    out.contestBanner = !!banner;
    if (banner) {
      banner.click();
      await new Promise((r) => setTimeout(r, 600));
      out.contestEntries = document.querySelectorAll('#contestEntries > *').length;
      window.closeContestModal?.();
    }
    return out;
  });
  evt.announceOpen ? ok('活動公告詳情', evt.announceTitle) : bad('活動公告詳情', JSON.stringify(evt));
  evt.contestBanner ? ok('照片比賽入口', `參賽 ${evt.contestEntries} 筆`) : bad('照片比賽入口', '無 contestBanner');

  // ---------- 5. 登入 + 頭像 + 使用者選單 ----------
  const login = await page.evaluate(async () => {
    window.openLoginModal();
    await new Promise((r) => setTimeout(r, 400));
    const el = document.getElementById('loginName');
    el.value = '測試員';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    window.memberLogin('facebook');
    await new Promise((r) => setTimeout(r, 1200));
    const entry = document.getElementById('userEntry');
    const menu = document.getElementById('userMenu');
    return {
      modalOpen: getComputedStyle(document.getElementById('loginModal')).display !== 'none',
      mode: state.user.mode,
      name: state.user.name,
      avatar: entry ? (entry.innerText.trim() + '|title=' + (entry.title || '')) : '',
      menuItems: menu ? Array.from(menu.querySelectorAll('button')).map((b) => b.textContent.trim()) : [],
    };
  });
  (login.mode === 'member' && !login.modalOpen)
    ? ok('登入流程 + 頭像顯示', `mode=${login.mode} name=${login.name} 頭像="${login.avatar}" 選單=${login.menuItems.join('/')}`)
    : bad('登入流程 + 頭像顯示', JSON.stringify(login));

  // ---------- 6. 發文 / 投稿上傳 UI ----------
  const post = await page.evaluate(async () => {
    window.openPostModal('social');
    await new Promise((r) => setTimeout(r, 700));
    const m = document.getElementById('postModal');
    const fields = {
      title: !!document.getElementById('postTitle'),
      text: !!document.getElementById('postText'),
      file: !!document.getElementById('postFile'),
      badge: !!document.getElementById('postTargetBadge'),
      submit: !!document.getElementById('postSubmitBtn'),
    };
    const submit = document.getElementById('postSubmitBtn');
    return {
      visible: getComputedStyle(m).display !== 'none',
      fields,
      submitText: submit?.textContent?.trim(),
      badgeText: document.getElementById('postTargetBadge')?.textContent?.trim(),
    };
  });
  (post.visible && Object.values(post.fields).every(Boolean))
    ? ok('發文/投稿上傳 UI', `標題/內文/上傳/目標/送出 齊全，送出鈕="${post.submitText}"`)
    : bad('發文/投稿上傳 UI', JSON.stringify(post));
  await page.evaluate(() => window.closePostModal?.());
  await page.waitForTimeout(300);

  // ---------- 7. 私訊頁開啟 + 訊息送出 ----------
  const dm = await page.evaluate(async () => {
    window.setTab('campsite');
    await new Promise((r) => setTimeout(r, 500));
    const cards = Array.from(document.querySelectorAll('#campsiteList > *'));
    let started = false;
    for (const card of cards) {
      const b = Array.from(card.querySelectorAll('button')).find((x) => x.textContent.includes('私訊商家'));
      if (b) { b.click(); started = true; break; }
    }
    await new Promise((r) => setTimeout(r, 1000));
    const modal = document.getElementById('dmModal');
    const out = {
      visible: getComputedStyle(modal).display !== 'none',
      started,
      threadsText: (document.getElementById('dmThreads')?.innerText || '').trim().slice(0, 60),
    };
    const threadBtn = document.querySelector('#dmThreads button');
    if (threadBtn) {
      threadBtn.click();
      await new Promise((r) => setTimeout(r, 700));
      const input = document.getElementById('dmInput');
      const sendBtn = Array.from(document.querySelectorAll('#dmComposer button')).find((x) => x.textContent.includes('送出'));
      out.composerVisible = getComputedStyle(document.getElementById('dmComposer')).display !== 'none';
      out.sendDisabled = sendBtn ? sendBtn.disabled : null;
      if (input && sendBtn && !sendBtn.disabled) {
        input.value = '自動化測試訊息';
        const before = (state.dmThreads.find((t) => t.id === currentDMStore)?.messages || []).length;
        window.sendDM();
        await new Promise((r) => setTimeout(r, 800));
        const after = (state.dmThreads.find((t) => t.id === currentDMStore)?.messages || []).length;
        out.sent = after > before;
        out.msgCount = after;
        out.lastMsg = (state.dmThreads.find((t) => t.id === currentDMStore)?.messages || []).slice(-1)[0]?.text;
      } else { out.sent = false; }
    }
    return out;
  });
  dm.visible ? ok('私訊頁開啟', `對話：${dm.threadsText.replace(/\s+/g, ' ')}`) : bad('私訊頁開啟', JSON.stringify(dm));
  dm.sent ? ok('私訊訊息送出', `訊息數 ${dm.msgCount} 內容="${dm.lastMsg}"`) : bad('私訊訊息送出', JSON.stringify(dm));

  // ---------- 8. 登出 ----------
  const logout = await page.evaluate(async () => {
    window.logout();
    await new Promise((r) => setTimeout(r, 800));
    return { mode: state.user.mode, name: state.user.name };
  });
  logout.mode === 'guest' ? ok('登出流程', 'mode=guest') : bad('登出流程', JSON.stringify(logout));

  // ---------- 9. 版面檢查 ----------
  const layout = await page.evaluate(async () => {
    window.setTab('social');
    await new Promise((r) => setTimeout(r, 500));
    const overflowX = document.documentElement.scrollWidth > window.innerWidth + 2;
    const tiny = Array.from(document.querySelectorAll('button, .tab')).filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.height < 20 || r.width < 20);
    }).length;
    const offscreen = Array.from(document.querySelectorAll('.tab')).filter((e) => e.getBoundingClientRect().right > window.innerWidth + 2).length;
    return { overflowX, tiny, offscreen, w: window.innerWidth, scrollW: document.documentElement.scrollWidth };
  });
  (!layout.overflowX && layout.tiny === 0 && layout.offscreen === 0)
    ? ok('版面無溢出 / 無過小按鈕', `w=${layout.w} scrollW=${layout.scrollW}`)
    : bad('版面無溢出 / 無過小按鈕', JSON.stringify(layout));

  // ---------- 10. 錯誤檢查 ----------
  consoleErrors.length === 0 ? ok('Console 無錯誤') : bad('Console 錯誤', consoleErrors.slice(0, 5).join(' | '));
  httpErrors.length === 0 ? ok('HTTP 無失敗回應') : bad('HTTP 失敗回應', httpErrors.slice(0, 5).join(' | '));

  // ---------- 12. 清理測試資料（避免污染正式資料） ----------
  const cleanup = await page.evaluate(async () => {
    try {
      const before = { members: state.memberAccounts.length, threads: state.dmThreads.length };
      state.memberAccounts = state.memberAccounts.filter((m) => m.name !== '測試員');
      state.dmThreads = state.dmThreads.filter((t) => !(t.messages || []).some((m) => m.text === '自動化測試訊息'));
      await window.saveState();
      return { ok: true, before, after: { members: state.memberAccounts.length, threads: state.dmThreads.length } };
    } catch (e) { return { ok: false, err: e.message }; }
  });
  cleanup.ok ? ok('測試資料清理', `會員 ${cleanup.before.members}→${cleanup.after.members}，對話 ${cleanup.before.threads}→${cleanup.after.threads}`) : bad('測試資料清理', JSON.stringify(cleanup));

  // ---------- 截圖 ----------
  await page.screenshot({ path: 'e2e-home.png', fullPage: false });
} catch (e) {
  bad('測試腳本執行', e.message);
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 1));
const fails = results.filter((r) => !r.pass);
console.log(`\nPASS: ${results.length - fails.length}  FAIL: ${fails.length}`);
process.exit(fails.length ? 1 : 0);
