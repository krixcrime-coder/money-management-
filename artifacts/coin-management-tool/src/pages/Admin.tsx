import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { format } from 'date-fns';
import { Trash2, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch users
      const uq = query(collection(db, 'users'), orderBy('joinDate', 'desc'));
      const uSnap = await getDocs(uq);
      const uData: any[] = [];
      uSnap.forEach((doc) => uData.push({ id: doc.id, ...doc.data() }));
      setUsers(uData);

      // Fetch screenshots
      const sq = query(collection(db, 'screenshots'), orderBy('date', 'desc'));
      const sSnap = await getDocs(sq);
      const sData: any[] = [];
      sSnap.forEach((doc) => sData.push({ id: doc.id, ...doc.data() }));
      setScreenshots(sData);
    } catch (error) {
      console.error("Admin fetch error", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetUser = async (userId: string, startingCoins: number) => {
    if (!confirm('Reset this user to Day 1?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        currentDay: 1,
        currentCoins: startingCoins,
        recoveryStatus: false,
        monthStartDate: serverTimestamp()
      });
      toast.success("User reset successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to reset user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Permanently delete this user record? (Auth record remains)')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success("User deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return <Layout><div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div></Layout>;
  }

  return (
    <Layout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Admin Control</h1>
          <p className="text-muted-foreground">System overview and user management.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Users</div>
          <div className="text-3xl font-bold text-foreground">{users.length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Screenshots</div>
          <div className="text-3xl font-bold text-foreground">{screenshots.length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-sm text-muted-foreground mb-1">Users in Recovery</div>
          <div className="text-3xl font-bold text-destructive">
            {users.filter(u => u.recoveryStatus).length}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/20">
            <h2 className="text-xl font-bold text-foreground">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Name / Email</th>
                  <th className="px-6 py-4 font-medium">Day</th>
                  <th className="px-6 py-4 font-medium">Balance</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{u.name}</div>
                      <div className="text-muted-foreground text-xs">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">{u.currentDay}/30</td>
                    <td className="px-6 py-4 font-mono">{u.currentCoins?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {u.recoveryStatus ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">Recovery</span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleResetUser(u.id, u.startingCoins || 100)}>
                          <RotateCcw size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteUser(u.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-white/5 bg-black/20">
            <h2 className="text-xl font-bold text-foreground">Recent Uploads</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Day</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {screenshots.slice(0, 10).map(s => (
                  <tr key={s.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-medium text-foreground">{s.userName}</td>
                    <td className="px-6 py-4">Day {s.dayNumber}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {s.date ? format(s.date.toDate(), 'MMM d, h:mm a') : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <a href={s.imageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <ImageIcon size={16} /> View Image
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
