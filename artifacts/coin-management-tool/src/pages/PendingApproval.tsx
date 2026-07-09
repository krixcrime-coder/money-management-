import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocation } from 'wouter';

const REFERRAL_LINK = import.meta.env.VITE_REFERRAL_LINK || 'https://your-game-link.com';

const steps = [
  {
    num: '01',
    icon: '🎮',
    title: 'Game Mein Login Karo Hamari Link Se',
    desc: 'Neeche di gayi link pe jaao aur game mein register/login karo. Isi link se account banana zaroori hai.',
    action: (
      <a
        href={REFERRAL_LINK}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-colors"
      >
        <span>🔗</span>
        <span className="font-mono text-xs break-all">{REFERRAL_LINK}</span>
      </a>
    ),
  },
  {
    num: '02',
    icon: '💰',
    title: 'Wallet Mein 100 Coins Add Karo',
    desc: 'Game ke andar apni wallet mein 100 coins add karo. Yeh starting balance hai — iske baad strategy shuru hogi.',
    action: null,
  },
  {
    num: '03',
    icon: '🆔',
    title: 'Apna Game UID Bhejo',
    desc: 'Game mein apna UID (User ID) dhundo aur neeche wale form mein enter karo. Admin verify karega aur access dega.',
    action: null,
  },
];

export default function PendingApproval() {
  const { user, userProfile, refreshProfile, logout } = useAuth();
  const [gameUid, setGameUid] = useState(userProfile?.gameUid || '');
  const [submitting, setSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  // Guard: unauthenticated users → /login
  if (!user) {
    setLocation('/login');
    return null;
  }

  // Guard: already approved → dashboard
  if (userProfile?.isApproved) {
    setLocation('/dashboard');
    return null;
  }

  const isRejected = userProfile?.isRejected;
  const hasSubmittedUid = !!userProfile?.gameUid;

  const handleSubmitUid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !gameUid.trim()) return;
    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        gameUid: gameUid.trim(),
        gameUidSubmittedAt: serverTimestamp(),
        isRejected: false,
      });
      await refreshProfile();
      toast.success('UID submit ho gayi! Admin jald verify karega.');
    } catch (err) {
      toast.error('Submit nahi hua. Dobara try karo.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5 bg-background/70 z-50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
          </div>
          <span className="text-sm font-bold tracking-widest text-foreground">COINMGMT</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      <div className="w-full max-w-lg relative z-10 pt-20 pb-10">

        {/* ── REJECTED STATE ── */}
        {isRejected ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-destructive mb-3">Access Reject Hua</h1>
            <p className="text-muted-foreground mb-2 leading-relaxed">
              {userProfile?.rejectionReason || 'Aapne hamare referral link se game mein register nahi kiya.'}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Pehle neeche di gayi link se game mein register karo, phir dobara UID submit karo.
            </p>
            <a
              href={REFERRAL_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors mb-6"
            >
              🔗 Referral Link Pe Jao
            </a>
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-muted-foreground mb-3">Register karne ke baad apna naya UID bhejo:</p>
              <form onSubmit={handleSubmitUid} className="flex gap-3">
                <Input
                  value={gameUid}
                  onChange={e => setGameUid(e.target.value)}
                  placeholder="Naya Game UID"
                  className="bg-black/20 border-white/10 flex-1"
                />
                <Button type="submit" disabled={submitting || !gameUid.trim()}>
                  {submitting ? '...' : 'Bhejo'}
                </Button>
              </form>
            </div>
          </div>
        ) : hasSubmittedUid ? (
          /* ── SUBMITTED / WAITING STATE ── */
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Review Mein Hai</h1>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Aapki request admin ke paas gayi hai. Jab approve ho jayega, aapka dashboard unlock ho jayega aur strategy shuru ho jayegi.
            </p>
            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-6">
              <span className="text-yellow-400 text-sm font-mono">Game UID:</span>
              <span className="text-yellow-300 font-bold font-mono">{userProfile?.gameUid}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Galat UID diya? Neeche correct karo:
            </p>
            <form onSubmit={handleSubmitUid} className="flex gap-3">
              <Input
                value={gameUid}
                onChange={e => setGameUid(e.target.value)}
                placeholder="Sahi Game UID"
                className="bg-black/20 border-white/10 flex-1"
              />
              <Button type="submit" variant="outline" disabled={submitting || !gameUid.trim() || gameUid.trim() === userProfile?.gameUid}>
                {submitting ? '...' : 'Update'}
              </Button>
            </form>
            <div className="mt-8 flex justify-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground text-xs gap-2" onClick={async () => { await refreshProfile(); toast.info('Status refresh ho gayi'); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Refresh Status
              </Button>
            </div>
          </div>
        ) : (
          /* ── STEPS / NEW USER STATE ── */
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium mb-5">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Approval Pending
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                Welcome, {userProfile?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Strategy shuru karne se pehle neeche ke <strong className="text-foreground">3 steps</strong> complete karo aur apna Game UID bhejo. Admin verify karega.
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-8">
              {steps.map((step, i) => (
                <div key={step.num} className="glass-card p-5 flex gap-4">
                  <div className="text-3xl shrink-0 mt-0.5">{step.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary/60">STEP {step.num}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                    {step.action}
                  </div>
                </div>
              ))}
            </div>

            {/* UID Submit Form */}
            <div className="glass-card p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-1">Apna Game UID Bhejo</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Game ke Profile → Settings mein UID milti hai (usually numbers ka combination).
              </p>
              <form onSubmit={handleSubmitUid} className="space-y-3">
                <Input
                  value={gameUid}
                  onChange={e => setGameUid(e.target.value)}
                  placeholder="e.g., 123456789"
                  className="bg-black/20 border-white/10 h-12 text-center text-lg tracking-widest font-mono"
                  required
                />
                <Button type="submit" className="w-full h-12" disabled={submitting || !gameUid.trim()}>
                  {submitting ? 'Bhej rahe hain...' : '🚀 UID Submit Karo & Approval Maango'}
                </Button>
              </form>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5">
              <p className="text-yellow-300/80 text-xs leading-relaxed">
                ⚠️ <strong>Zaroori:</strong> Sirf woh accounts approve honge jinke game UID valid honge aur jinhone hamare referral link se join kiya ho. Fake UID ya link se register na karne par account reject hoga.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
