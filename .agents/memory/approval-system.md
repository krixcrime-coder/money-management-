---
name: Approval System Architecture
description: Admin approval flow for Coin Management Tool — users need admin approval before strategy starts
---

## Rule
New users get isApproved:false on registration. Strategy only starts after admin approves them via /admin panel.

## Key fields on users/{uid}
- isApproved: boolean — set true only by admin
- isRejected: boolean — admin can reject with reason
- rejectionReason?: string
- gameUid?: string — user submits their game UID for admin verification
- gameUidSubmittedAt?: Timestamp

## Flow
1. Register → currentCoins:100 auto-set, isApproved:false, redirect /pending
2. /pending shows 3 steps + UID form; states: new/submitted/rejected
3. Admin /admin → Pending tab → Approve (sets isApproved:true, setupComplete:true, monthStartDate:now) or Reject (with reason)
4. On approve, ProtectedRoute lets user through to /dashboard

## ProtectedRoute logic
- !user → /login
- !userProfile (null, fetch failed) → spinner (block access)
- isAdmin → pass through (no approval needed)
- !isApproved → /pending
- else → render children

## Security
- Firestore rules must prevent users from writing isApproved/setupComplete/currentDay themselves
- Only admin can write privileged fields (see GITHUB_SETUP_GUIDE.md Part 7)

**Why:** Without strict rules, any user can self-approve via browser console Firestore writes.
**How to apply:** Always update Firestore rules when deploying; the strict rules are in GITHUB_SETUP_GUIDE.md.
