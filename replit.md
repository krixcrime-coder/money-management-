# Coin Management Tool

A disciplined coin tracking web app for a coin-based game. Users start with any number of coins and follow a daily strategy to reach 10,000 coins in 30 days.

## Run & Operate

- `pnpm --filter @workspace/coin-management-tool run dev` — run the frontend (port auto-assigned)
- `pnpm --filter @workspace/coin-management-tool run typecheck` — typecheck the app
- Required env vars (set as Replit Secrets/Env Vars):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_DATABASE_URL`
  - `VITE_FIREBASE_APP_ID` — **needs web app ID from Firebase Console → Project Settings → Add app → Web**

## Stack

- React + Vite + TypeScript
- Firebase Auth (authentication)
- Firestore (database)
- Firebase Storage (screenshot uploads)
- Tailwind CSS + glassmorphism dark theme
- Recharts (analytics charts)
- Wouter (routing)
- Sonner (toast notifications)

## Where things live

- `artifacts/coin-management-tool/src/lib/firebase.ts` — Firebase init
- `artifacts/coin-management-tool/src/lib/strategyEngine.ts` — daily target/stop-loss calculator
- `artifacts/coin-management-tool/src/contexts/AuthContext.tsx` — auth state + Firestore profile
- `artifacts/coin-management-tool/src/pages/` — all pages
- `artifacts/coin-management-tool/src/components/` — Layout, ProtectedRoute, AdminRoute, ScreenshotUpload

## Architecture decisions

- **Firebase-only, no Express backend** — frontend talks directly to Firestore/Auth/Storage
- **Dark mode forced** — :root and .dark have identical values; app is always dark
- **Strategy engine is pure math** — `calculateDailyStrategy(coins, day, isRecovery)` returns targets
- **Admin flag** — `isAdmin: true` on Firestore user doc unlocks /admin panel
- **VITE_FIREBASE_APP_ID** — must be web app ID (not Android). Get from Firebase Console if missing

## Product

- Register/Login with Firebase Auth; forgot password via email
- First login: set starting balance → begins 30-day strategy
- Dashboard: daily strategy card (locked before 10 AM on day 2+), action buttons (Target Achieved / Stop Loss Hit)
- Recovery mode: activates on stop loss, adjusts next-day targets gradually
- 30-day timeline with color-coded day status
- Analytics: growth chart, profit/loss bar chart, stats
- Screenshot upload to Firebase Storage after each completed day
- Admin panel: view/delete users, see screenshots, reset monthly plans

## User preferences

- Tool must be hosted on GitHub Pages + Firebase backend
- Dark glassmorphism UI (blue + green accents)

## Gotchas

- `VITE_FIREBASE_APP_ID` is currently missing (Android config was provided, not web). Add web app in Firebase Console.
- Firebase Firestore rules must allow authenticated reads/writes in production
- Screenshot upload requires Firebase Storage rules to allow authenticated users

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
