# 🚀 GitHub Setup Guide — Coin Management Tool

Is guide mein sab kuch step by step hai:
1. GitHub repo banana
2. Files push karna (Shell se)
3. GitHub Pages pe deploy karna
4. Admin panel access karna

---

## 📁 PART 1 — GitHub Par Nayi Repo Banana

### Step 1: GitHub Account Pe Jao
Khulio: https://github.com → Login karo

### Step 2: Nayi Repository Banao
1. **"New"** button dabao (top-right ke paas, green button)
2. Fill karo:
   - **Repository name:** `coin-management-tool`
   - **Description:** `30-day coin discipline tracker`
   - **Visibility:** `Public` ✅ (GitHub Pages free ke liye public chahiye)
   - ❌ **"Add README"** wala checkbox mat dabao (hum khud push karenge)
3. **"Create repository"** dabao

### Step 3: Repo URL Copy Karo
Banane ke baad yeh jaise URL milegi:
```
https://github.com/YOUR_USERNAME/coin-management-tool.git
```
Yeh URL save rakhna — neeche kaam aayegi.

---

## 💻 PART 2 — Replit Shell Se Files GitHub Pe Push Karna

### Step 1: Replit mein Shell kholo
Replit ke andar **Shell** tab pe click karo

### Step 2: Coin Management Tool folder mein jao
```bash
cd artifacts/coin-management-tool
```

### Step 3: Git Initialize Karo (Pehli baar)
```bash
git init
git add .
git commit -m "Initial commit: Coin Management Tool"
```

### Step 4: GitHub Repo Se Connect Karo
```bash
git remote add origin https://github.com/YOUR_USERNAME/coin-management-tool.git
git branch -M main
```
> ⚠️ `YOUR_USERNAME` ki jagah apna actual GitHub username likhna

### Step 5: Push Karo
```bash
git push -u origin main
```
> GitHub password maangega — password ki jagah **Personal Access Token** chahiye (neeche bataya hai)

---

## 🔑 PART 3 — GitHub Personal Access Token Banana (Zaroori!)

GitHub ne 2021 se password se push band kar diya. Token chahiye.

### Steps:
1. GitHub → top-right avatar → **Settings**
2. Left sidebar mein scroll karo → **Developer settings** (sabse neeche)
3. **Personal access tokens** → **Tokens (classic)**
4. **"Generate new token (classic)"** dabao
5. Fill karo:
   - **Note:** `replit-push`
   - **Expiration:** `90 days`
   - **Scopes:** ✅ `repo` (poora repo access)
6. **"Generate token"** dabao
7. Token copy karo (sirf ek baar dikhega!) — kisi safe jagah save karo

### Token Use Karna:
Jab `git push` mein password maange:
- **Username:** apna GitHub username
- **Password:** upar wala token paste karo (password nahi!)

---

## 🌐 PART 4 — GitHub Pages Pe Deploy Karna

### Step 1: Build File Banana
```bash
# Pehle Replit shell mein yeh commands chalaao:
cd /home/runner/workspace
pnpm --filter @workspace/coin-management-tool run build
```
Yeh `artifacts/coin-management-tool/dist/public/` folder mein files banayega.

### Step 2: `vite.config.ts` mein Base URL Set Karo
GitHub Pages ka URL hota hai:
```
https://YOUR_USERNAME.github.io/coin-management-tool/
```

Isliye `artifacts/coin-management-tool/vite.config.ts` mein:
```ts
export default defineConfig({
  base: '/coin-management-tool/',   // ← yeh add karo
  // ... baaki config
})
```

### Step 3: GitHub Pages Enable Karo
1. GitHub repo → **Settings** tab
2. Left sidebar → **Pages**
3. **Source:** `Deploy from a branch`
4. **Branch:** `main` / `docs` ya `gh-pages`
5. **Folder:** `/(root)` ya `/docs`

### Step 4: `gh-pages` Package Se Easy Deploy (Recommended)
```bash
# Install (sirf ek baar)
cd artifacts/coin-management-tool
pnpm add -D gh-pages

# package.json mein script add karo:
# "deploy": "gh-pages -d dist/public"

# Deploy karo:
pnpm run build
pnpm run deploy
```
Yeh automatically `gh-pages` branch banayega aur app live ho jayegi!

---

## 👑 PART 5 — Admin Panel Access Karna

### Admin Panel URL:
```
https://your-app-url.com/admin
```
Ya locally:
```
http://localhost:PORT/admin
```

### Admin Access Kaise Milta Hai?

**Admin panel sirf us user ko dikhai deta hai jiska Firestore mein `isAdmin: true` ho.**

#### Step 1: Firebase Console Kholo
https://console.firebase.google.com → `tuni-653cf` project

#### Step 2: Firestore Database
1. Left sidebar → **Firestore Database**
2. `users` collection pe click karo
3. Apna user ID wala document dhundo (email se pehchano)
4. Document pe click karo → **Edit** (pencil icon)

#### Step 3: `isAdmin` Field Add/Update Karo
```
Field name:  isAdmin
Type:        boolean
Value:       true
```
**Save** karo.

#### Step 4: App Refresh Karo
App mein logout karo, wapas login karo. Ab sidebar mein **Admin** link aayega aur `/admin` route accessible hoga.

---

## 🔒 PART 6 — Firebase Security Rules (Production Ke Liye Zaroori!)

Firebase Console → Firestore → **Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users apna khud ka data padh/likh sakte hain
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Daily progress sirf apna
    match /users/{userId}/dailyProgress/{day} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Screenshots: likhna sab kar sakte hain, padhna admin ya khud
    match /screenshots/{docId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      allow delete: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

Firebase Storage Rules (Storage → **Rules** tab):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // screenshots/{userId}/day_{day}/{file} — sirf apna upload
    match /screenshots/{userId}/{allPaths=**} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true
      );
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🔒 PART 7 — Strict Security: Users Khud Ko Approve Nahi Kar Sakte

**Yeh bahut zaroori hai!** Neeche wale Firestore rules se sirf admin hi `isApproved`, `isRejected`, `setupComplete`, `currentDay`, `monthStartDate` update kar sakta hai. Normal user sirf apna `gameUid` update kar sakta hai:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Admin check helper
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Fields sirf admin update kar sakta hai
    function onlyNonPrivilegedFields() {
      return !request.resource.data.diff(resource.data).affectedKeys()
        .hasAny(['isApproved', 'isRejected', 'rejectionReason', 'setupComplete',
                 'currentDay', 'currentCoins', 'startingCoins', 'monthStartDate',
                 'recoveryStatus', 'isAdmin']);
    }

    match /users/{userId} {
      // Padhna: khud ya admin
      allow read: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());

      // Create: sirf apna account banana (registration)
      allow create: if request.auth != null && request.auth.uid == userId;

      // Update: admin sab kuch update kar sakta hai;
      //         normal user sirf gameUid aur non-privileged fields
      allow update: if request.auth != null && (
        isAdmin() ||
        (request.auth.uid == userId && onlyNonPrivilegedFields())
      );

      // Delete: sirf admin
      allow delete: if isAdmin();
    }

    match /users/{userId}/dailyProgress/{day} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /screenshots/{docId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        request.auth.uid == resource.data.userId || isAdmin()
      );
      allow delete: if isAdmin();
    }
  }
}
```

> **Yeh rules Firebase Console → Firestore → Rules tab mein paste karo aur Publish karo!**

---

## ✅ Quick Checklist

- [ ] GitHub repo bana li
- [ ] Personal Access Token banaya
- [ ] `git init`, `add`, `commit`, `push` kar diya
- [ ] Firebase Console mein:
  - [ ] Authentication → Email/Password enable kiya
  - [ ] Firestore Database create kiya
  - [ ] Storage enable kiya
  - [ ] Firestore Rules set kiye
  - [ ] Storage Rules set kiye
  - [ ] Web App add karke `VITE_FIREBASE_APP_ID` set ki
- [ ] Apna user `isAdmin: true` kar diya
- [ ] GitHub Pages enable kiya (agar deploy karna hai)

---

*Koi step mein problem aaye toh batao!*
