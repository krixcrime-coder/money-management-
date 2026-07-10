import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Auto-generate username from email
function generateUsername(email: string): string {
  const prefix = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return prefix || 'user' + Math.floor(Math.random() * 9999);
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await register(email, password);

      // Auto-generate username from email
      const autoName = generateUsername(email);

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name: autoName,
        email,
        joinDate: serverTimestamp(),
        currentCoins: 100,
        startingCoins: 100,
        currentDay: 1,
        recoveryStatus: false,
        monthStartDate: null,
        isAdmin: false,
        setupComplete: false,
        isApproved: false,
        isRejected: false,
        gameUid: '',
        gameUidSubmittedAt: null,
      });

      toast.success(`Account created! Username: ${autoName}`);
      setLocation('/pending');
    } catch (error: any) {
      const msg = error.code === 'auth/email-already-in-use'
        ? 'This email is already registered'
        : error.message;
      toast.error('Registration failed', { description: msg });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm glass-card p-8 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <div className="w-7 h-7 rounded-full bg-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-1 text-sm text-center">
            Register with your email — your username is generated automatically
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="bg-black/20 border-white/10 h-12"
          />
          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="bg-black/20 border-white/10 h-12"
            minLength={6}
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="bg-black/20 border-white/10 h-12"
            minLength={6}
          />

          {/* Auto-username preview */}
          {email.includes('@') && (
            <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
              👤 Your username will be:{' '}
              <span className="text-primary font-mono font-semibold">
                {generateUsername(email)}
              </span>
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-md mt-2" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login">
            <span className="text-primary hover:underline cursor-pointer font-medium">Log in</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center max-w-xs text-xs text-muted-foreground/50 px-4">
        ⚠️ This app does not predict game results. It is a discipline tool only.
      </div>
    </div>
  );
}
