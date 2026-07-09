import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface Screenshot {
  id: string;
  dayNumber: number;
  date: any;
  imageUrl: string;
  status: string;
}

export default function Screenshots() {
  const { user } = useAuth();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreenshots = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'screenshots'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data: Screenshot[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Screenshot);
        });
        setScreenshots(data);
      } catch (error) {
        console.error("Error fetching screenshots:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchScreenshots();
  }, [user]);

  return (
    <Layout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Screenshot Proofs</h1>
          <p className="text-muted-foreground">Your verified daily balance records.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : screenshots.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">No screenshots yet</h3>
          <p className="text-sm text-muted-foreground max-w-[300px] mt-2">
            Upload your first balance screenshot from the dashboard after completing today's target.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenshots.map((shot) => (
            <div key={shot.id} className="glass-card overflow-hidden group">
              <div className="aspect-[4/3] bg-black/40 relative overflow-hidden">
                <img 
                  src={shot.imageUrl} 
                  alt={`Day ${shot.dayNumber} balance`} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                  <a href={shot.imageUrl} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
                    View Full Image <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-t border-white/5">
                <div>
                  <div className="font-bold text-foreground text-lg">Day {shot.dayNumber}</div>
                  <div className="text-xs text-muted-foreground">
                    {shot.date ? format(shot.date.toDate(), 'MMM d, yyyy') : 'Unknown date'}
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium">
                  Verified
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
