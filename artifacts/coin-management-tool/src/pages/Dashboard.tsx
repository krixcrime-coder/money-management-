import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { calculateDailyStrategy } from '../lib/strategyEngine';
import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScreenshotUpload } from '../components/ScreenshotUpload';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function Dashboard() {
  const { user, userProfile, refreshProfile } = useAuth();
  const [strategy, setStrategy] = useState<ReturnType<typeof calculateDailyStrategy> | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [dailyStatus, setDailyStatus] = useState<'pending' | 'completed' | 'loss' | 'recovery'>('pending');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'target' | 'loss' | null>(null);
  
  useEffect(() => {
    if (!userProfile) return;

    const currentStrategy = calculateDailyStrategy(
      userProfile.currentCoins,
      userProfile.currentDay,
      userProfile.recoveryStatus
    );
    setStrategy(currentStrategy);

    // Check lock status (unlocks at 10 AM local time)
    const checkLock = () => {
      const now = new Date();
      const hours = now.getHours();
      // If day 1, never locked. Otherwise, locked before 10 AM
      if (userProfile.currentDay === 1) {
        setIsLocked(false);
      } else {
        setIsLocked(hours < 10);
      }
    };
    checkLock();
    const interval = setInterval(checkLock, 60000); // Check every minute

    // Fetch today's progress status
    const fetchTodayProgress = async () => {
      if (!user) return;
      const dayRef = doc(db, `users/${user.uid}/dailyProgress`, userProfile.currentDay.toString());
      const daySnap = await getDoc(dayRef);
      if (daySnap.exists()) {
        const data = daySnap.data();
        setDailyStatus(data.status);
        if (data.status === 'completed' || data.status === 'loss') {
          setShowUpload(!data.screenshotUrl);
        }
      } else {
        // Initialize today's pending progress
        await setDoc(dayRef, {
          day: userProfile.currentDay,
          date: serverTimestamp(),
          startBalance: userProfile.currentCoins,
          targetBalance: currentStrategy.targetBalance,
          stopLossBalance: currentStrategy.stopLossBalance,
          targetProfit: currentStrategy.targetProfit,
          maxLoss: currentStrategy.maxLoss,
          status: 'pending',
          endBalance: null,
          screenshotUrl: null,
        });
        setDailyStatus('pending');
      }
    };
    fetchTodayProgress();

    return () => clearInterval(interval);
  }, [userProfile, user]);

  const handleAction = async (type: 'target' | 'loss') => {
    if (!user || !userProfile || !strategy) return;

    setModalType(type);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!user || !userProfile || !strategy || !modalType) return;
    
    try {
      const isTarget = modalType === 'target';
      const endBalance = isTarget ? strategy.targetBalance : strategy.stopLossBalance;
      const status = isTarget ? 'completed' : 'loss';
      
      const dayRef = doc(db, `users/${user.uid}/dailyProgress`, userProfile.currentDay.toString());
      await updateDoc(dayRef, {
        status,
        endBalance,
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        currentCoins: endBalance,
        currentDay: isTarget ? userProfile.currentDay + 1 : userProfile.currentDay,
        recoveryStatus: !isTarget,
      });

      toast.success(isTarget ? 'Target achieved! Great discipline.' : 'Stop loss hit. Recovery mode activated.');
      setDailyStatus(status);
      setShowUpload(true);
      setModalOpen(false);
      await refreshProfile();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save progress');
    }
  };

  if (!userProfile || !strategy) return <Layout><div className="p-8 text-center">Loading...</div></Layout>;

  const progressPercent = Math.min(100, Math.max(0, (userProfile.currentCoins / 10000) * 100));
  const monthPercent = ((userProfile.currentDay - 1) / 30) * 100;

  return (
    <Layout>
      <div className="w-full bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-lg mb-8 text-sm flex items-center justify-center gap-2">
        <span className="text-xl">⚠️</span> 
        <span className="font-medium opacity-90">This application does NOT predict game results. Every game outcome is random. This tool is only for coin management and discipline.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Balance Card */}
        <div className="glass-card p-6 lg:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500"></div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Current Balance</h2>
          <div className="text-5xl font-bold text-foreground tracking-tight mb-4">{userProfile.currentCoins.toLocaleString()} <span className="text-2xl text-muted-foreground font-normal">coins</span></div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Progress to 10k</span>
              <span className="text-primary">{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-black/40" />
          </div>
        </div>

        {/* Day Progress */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h2>
          <div className="text-3xl font-bold text-foreground mb-1">Day {userProfile.currentDay}</div>
          <div className="text-sm text-muted-foreground mb-4">{30 - userProfile.currentDay + 1} days remaining</div>
          <Progress value={monthPercent} className="h-1.5 bg-black/40" />
        </div>

        {/* Status */}
        <div className="glass-card p-6 flex flex-col">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Status</h2>
          <div className="flex-1 flex flex-col justify-center">
            {userProfile.recoveryStatus ? (
              <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1.5 rounded-full text-sm font-medium w-fit">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
                Recovery Mode
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full text-sm font-medium w-fit">
                <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                Normal Growth
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-4">
              {userProfile.recoveryStatus 
                ? "Reduced targets to safely recover from recent loss."
                : "Optimal growth trajectory active."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden relative">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
            <div>
              <h2 className="text-xl font-bold text-foreground">Today's Strategy</h2>
              <p className="text-sm text-muted-foreground">Adhere strictly to these limits.</p>
            </div>
            {isLocked && dailyStatus === 'pending' && (
              <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-white/10">
                🔒 Locked until 10:00 AM
              </div>
            )}
          </div>
          
          {isLocked && dailyStatus === 'pending' ? (
            <div className="p-10 md:p-14 flex flex-col items-center justify-center text-center">
              <span className="text-4xl mb-3">🔒</span>
              <p className="font-semibold text-foreground">Strategy Locked</p>
              <p className="text-sm text-muted-foreground max-w-[240px] mt-1">
                Today's targets will reveal after 10:00 AM local time.
              </p>
            </div>
          ) : (
            <div className="p-6 md:p-8 grid grid-cols-2 gap-8 transition-all duration-500">
              <div className="space-y-1">
                <div className="text-sm text-secondary font-medium">Target Balance</div>
                <div className="text-3xl font-bold text-foreground">{strategy.targetBalance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">+{strategy.targetProfit.toLocaleString()} coins ({(strategy.growthRate * 100).toFixed(1)}%)</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-destructive font-medium">Stop Loss</div>
                <div className="text-3xl font-bold text-foreground">{strategy.stopLossBalance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">-{strategy.maxLoss.toLocaleString()} coins max loss</div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card p-6 flex flex-col justify-center">
          {dailyStatus === 'pending' && !showUpload ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">Record Today's Outcome</h3>
              <Button 
                onClick={() => handleAction('target')} 
                disabled={isLocked}
                className="w-full h-14 bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-lg transition-all"
              >
                Target Achieved
              </Button>
              <Button 
                onClick={() => handleAction('loss')} 
                disabled={isLocked}
                variant="outline" 
                className="w-full h-14 bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30 text-lg transition-all"
              >
                Stop Loss Hit
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${dailyStatus === 'completed' ? 'bg-secondary/20 text-secondary' : 'bg-destructive/20 text-destructive'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {dailyStatus === 'completed' ? <polyline points="20 6 9 17 4 12"></polyline> : <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">
                {dailyStatus === 'completed' ? 'Target Achieved' : 'Stop Loss Hit'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {showUpload ? 'Awaiting screenshot upload.' : 'Progress recorded for today.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <ScreenshotUpload 
          dayNumber={userProfile.currentDay} 
          onSuccess={() => {
            setShowUpload(false);
            refreshProfile();
          }} 
        />
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className={modalType === 'target' ? 'text-secondary' : 'text-destructive'}>
              {modalType === 'target' ? 'Confirm Target Achieved' : 'Confirm Stop Loss'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground pt-2">
              {modalType === 'target' 
                ? "Congratulations on reaching today's target! Please stop playing now to protect your gains. Proceeding will advance you to the next day."
                : "You've hit your stop loss. It is crucial to stop playing immediately to prevent further losses. Proceeding will activate recovery mode for tomorrow."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button 
              className={modalType === 'target' ? 'bg-secondary hover:bg-secondary/90 text-black' : 'bg-destructive hover:bg-destructive/90 text-white'} 
              onClick={confirmAction}
            >
              {modalType === 'target' ? 'Confirm Target' : 'Activate Recovery'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
