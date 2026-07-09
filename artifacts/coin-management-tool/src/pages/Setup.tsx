import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Setup() {
  const [startingCoins, setStartingCoins] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, userProfile, refreshProfile } = useAuth();
  const [, setLocation] = useLocation();

  // If already set up, redirect
  if (userProfile?.setupComplete) {
    setLocation('/dashboard');
    return null;
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const coins = parseInt(startingCoins);
    
    if (isNaN(coins) || coins < 0) {
      toast.error('Please enter a valid starting amount');
      return;
    }

    if (!user) return;

    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        startingCoins: coins,
        currentCoins: coins,
        setupComplete: true,
        monthStartDate: serverTimestamp(),
      });
      
      await refreshProfile();
      toast.success('Setup complete! Welcome to your 30-day journey.');
      setLocation('/dashboard');
    } catch (error: any) {
      toast.error('Setup failed', {
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md glass-card p-8 relative z-10 text-center">
        <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">Welcome, {userProfile?.name}</h1>
        <p className="text-muted-foreground text-sm mb-8">
          To begin your 30-day journey to 10,000 coins, please enter your current coin balance.
        </p>

        <form onSubmit={handleSetup} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-foreground">Current Coin Balance</label>
            <Input
              type="number"
              placeholder="e.g., 100"
              value={startingCoins}
              onChange={(e) => setStartingCoins(e.target.value)}
              required
              min="0"
              max="10000"
              className="bg-black/20 border-white/10 text-xl h-14 text-center tracking-wider"
            />
          </div>
          
          <Button type="submit" className="w-full h-12 text-md bg-secondary hover:bg-secondary/80 text-secondary-foreground" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Start My Journey'}
          </Button>
        </form>
      </div>
    </div>
  );
}
