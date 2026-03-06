# Outdoor Camping - GCP MVP Setup

## Scope (MVP)
- Firebase Auth: Google login
- Firestore + Storage
- Dual envs: dev/prod
- Payment provider (NewebPay) to be connected in next step (requires merchant keys)

## Current app wiring
- `index.html` supports env switch by query: `?env=dev` or `?env=prod`
- Firebase configs are in `FIREBASE_CONFIGS` (dev/prod)
- Google button now uses Firebase OAuth popup (`googleAuthLogin()`)

## What Teddy needs to provide
1. Google account that owns GCP/Firebase projects
2. Firebase Web config for **dev** project
3. Firebase Web config for **prod** project
4. NewebPay test credentials (MerchantID/HashKey/HashIV)

## Note
- I (assistant) do not have your Google account or passwords.
- I can complete all technical setup once credentials/project access is provided.
