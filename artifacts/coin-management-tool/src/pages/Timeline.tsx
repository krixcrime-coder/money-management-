import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Layout } from '../components/Layout';

interface DayRecord {
  day: number;
  status: 'pending' | 'completed' | 'loss' | 'recovery';
  targetBalance: number;
  endBalance: number | null;
}

export default function Timeline() {
  const { user, userProfile } = useAuth();
  const [history, setHistory] = useState<Record<number, DayRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, `users/${user.uid}/dailyProgress`),
          orderBy('day', 'asc')
        );
        const snapshot = await getDocs(q);
        const records: Record<number, DayRecord> = {};
        snapshot.forEach((doc) => {
          const data = doc.data() as DayRecord;
          records[data.day] = data;
        });
        setHistory(records);
      } catch (error) {
        console.error("Error fetching timeline:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (!userProfile || loading) {
    return <Layout><div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></Layout>;
  }

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Timeline</h1>
        <p className="text-muted-foreground">Your 30-day journey at a glance.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {days.map((day) => {
          const record = history[day];
          const isCurrent = day === userProfile.currentDay;
          const isFuture = day > userProfile.currentDay;
          const isPast = day < userProfile.currentDay;
          
          let bgColor = "bg-black/20 border-white/5";
          let textColor = "text-muted-foreground";
          let icon = null;
          
          if (isCurrent) {
            bgColor = "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]";
            textColor = "text-primary font-bold";
            icon = <div className="w-2 h-2 rounded-full bg-primary animate-pulse absolute top-3 right-3"></div>;
          } else if (record) {
            if (record.status === 'completed') {
              bgColor = "bg-secondary/10 border-secondary/30";
              textColor = "text-secondary";
              icon = <svg className="absolute top-3 right-3 w-4 h-4 text-secondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
            } else if (record.status === 'loss') {
              bgColor = "bg-destructive/10 border-destructive/30";
              textColor = "text-destructive";
              icon = <svg className="absolute top-3 right-3 w-4 h-4 text-destructive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
            }
          } else if (isFuture) {
            bgColor = "bg-white/[0.02] border-white/5 opacity-50";
            icon = <svg className="absolute top-3 right-3 w-3 h-3 text-muted-foreground/30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
          }

          return (
            <div key={day} className={`relative p-4 rounded-xl border flex flex-col justify-between aspect-square transition-all ${bgColor}`}>
              {icon}
              <div className={`text-sm ${textColor}`}>Day {day}</div>
              
              <div className="mt-auto">
                {record?.endBalance ? (
                  <div className="font-bold text-foreground text-lg tracking-tight">
                    {record.endBalance.toLocaleString()}
                  </div>
                ) : isCurrent ? (
                  <div className="text-xs text-primary font-medium">In Progress</div>
                ) : (
                  <div className="w-8 h-1 rounded bg-white/10"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
