# Outdoor Camping App 上架代辦清單（可勾選）

> 目標：把 `camping-app` 從 Web 版推進到可上架 iOS/Android App。

## A. Web 穩定版（先打底）

- [ ] 鎖定穩定版本（建議標記 v41.0）
- [ ] 完整回歸測試：登入（Google/LINE）
- [ ] 完整回歸測試：貼文/留言/比賽/私訊
- [ ] 完整回歸測試：商家後台/平台後台
- [ ] 修復阻斷型 bug（白屏、按鈕失效、登入卡住）
- [ ] 確認 Firebase dev/prod 設定一致

## B. PWA（可安裝到主畫面）

- [ ] 新增/確認 `manifest.json`
- [ ] 準備 App 圖示（192, 512）
- [ ] 加入 iOS/Android PWA meta tags
- [ ] 建立 Service Worker（快取策略）
- [ ] 測試「加入主畫面」流程（iOS Safari / Android Chrome）

## C. 原生打包（Capacitor）

- [ ] 建立 Capacitor 專案骨架
- [ ] 匯入現有 Web build
- [ ] 建 Android 專案（Android Studio）
- [ ] 建 iOS 專案（Xcode）
- [ ] 設定 App ID / Bundle ID
- [ ] 設定 app icon / splash
- [ ] 測試實機啟動與返回行為

## D. 登入與後端（上架前必做）

- [ ] Google 登入（prod）最終驗證
- [ ] LINE 登入（prod）最終驗證
- [ ] Facebook 登入（可選，若要上線就補）
- [ ] Firebase Security Rules 審核與收斂
- [ ] 錯誤監控（至少 console + log 追蹤）

## E. 金流（藍新，後段接）

- [ ] 取得藍新測試商店資訊（MerchantID/HashKey/HashIV）
- [ ] 建立後端簽章與交易建立 API
- [ ] 建 webhook callback 驗證
- [ ] 訂單狀態寫回 Firestore
- [ ] 測試成功/失敗/取消/重複通知
- [ ] 切正式環境金鑰前安全檢查

## F. 商店上架素材

- [ ] App 正式名稱確認（Outdoor Camping）
- [ ] App 副標與簡介文案
- [ ] 截圖（iOS/Android 各尺寸）
- [ ] 隱私政策頁面（公開網址）
- [ ] 使用條款頁面（公開網址）
- [ ] 客服聯絡方式（Email/表單）

## G. 帳號與費用

- [ ] Apple Developer Program（USD 99/年）
- [ ] Google Play Console（USD 25 一次）
- [ ] 開啟雙重驗證與備援聯絡人

## H. 送審前最後檢查（Release Checklist）

- [ ] `env=prod` 全流程驗證
- [ ] 無 debug 文案/測試按鈕殘留
- [ ] 版本號、build number 正確
- [ ] 隱私權限說明與實際行為一致
- [ ] 審核測試帳號可用
- [ ] 付款（若啟用）可完整走通

## I. 上架節奏（建議）

- [ ] 先上 Google Play（內測/封測）
- [ ] 修正回饋後再送 App Store
- [ ] 設定監控與回報機制（崩潰/登入/支付）
- [ ] 規劃 v1.1 小更新（UI/UX 優化）

---

## 你現在可以直接開始的三件事

1. [ ] 先把 Apple/Google 開發者帳號辦好
2. [ ] 提供藍新測試金流三個值
3. [ ] 確認是否先走「Google Play 內測」
