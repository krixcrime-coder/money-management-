import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
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
    
    setIsLoading(true);
    try {
      const userCredential = await register(email, password);
      
      // Create user profile
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        joinDate: serverTimestamp(),
        currentCoins: 0,
        startingCoins: 0,
        currentDay: 1,
        recoveryStatus: false,
        monthStartDate: serverTimestamp(),
        isAdmin: false,
        setupComplete: false,
      });

      toast.success('Registration successful!');
      setLocation('/setup');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h1>
          <p className="text-muted-foreground mt-2 text-sm">Start your 30-day discipline journey.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-black/20 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/20 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/20 border-white/10"
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-black/20 border-white/10"
              minLength={6}
            />
          </div>
          
          <Button type="submit" className="w-full h-11 mt-6" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/">
            <span className="text-primary hover:underline cursor-pointer font-medium">Log in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
