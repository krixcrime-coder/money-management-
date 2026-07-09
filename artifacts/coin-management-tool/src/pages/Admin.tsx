import React, { useEffect, useState } from 'react';
import {
  collection, query, getDocs, orderBy, deleteDoc,
  doc, updateDoc, serverTimestamp, where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Layout } from '../components/Layout';
import { format } from 'date-fns';
import { Trash2, RotateCcw, Image as ImageIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Admin() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'screenshots'>('pending');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const uq = query(collection(db, 'users'), orderBy('joinDate', 'desc'));
      const uSnap = await getDocs(uq);
      const allUsers: any[] = [];
      uSnap.forEach((d) => allUsers.push({ id: d.id, ...d.data() }));

      setPendingUsers(allUsers.filter(u => !u.isAdmin && !u.isApproved));
      setApprovedUsers(allUsers.filter(u => !u.isAdmin && u.isApproved));

      const sq = query(collection(db, 'screenshots'), orderBy('date', 'desc'));
      const sSnap = await getDocs(sq);
      const sData: any[] = [];
      sSnap.forEach((d) => sData.push({ id: d.id, ...d.data() }));
      setScreenshots(sData);
    } catch (error) {
      console.error('Admin fetch error', error);
      toast.error('Data load nahi hua');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Approve user ──
  const handleApprove = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: true,
        isRejected: false,
        rejectionReason: '',
        setupComplete: true,
        monthStartDate: serverTimestamp(),
        currentCoins: 100,
        startingCoins: 100,
        currentDay: 1,
      });
      toast.success('User approve ho gaya! Strategy shuru ho gayi.');
      fetchData();
    } catch {
      toast.error('Approve nahi hua');
    }
  };

  // ── Reject user ──
  const handleReject = async (userId: string) => {
    const reason = rejectReason[userId] ||
      'Aapne hamare referral link se game mein register nahi kiya. Pehle woh karo phir dobara UID bhejo.';
    try {
      await updateDoc(doc(db, 'users', userId), {
        isRejected: true,
        isApproved: false,
        rejectionReason: reason,
      });
      toast.success('User reject kar diya. Unhe message mil gaya.');
      fetchData();
    } catch {
      toast.error('Reject nahi hua');
    }
  };

  // ── Reset user ──
  const handleResetUser = async (userId: string) => {
    if (!confirm('Is user ko Day 1 pe reset karo?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        currentDay: 1,
        currentCoins: 100,
        recoveryStatus: false,
        monthStartDate: serverTimestamp(),
      });
      toast.success('User reset ho gaya');
      fetchData();
    } catch {
      toast.error('Reset nahi hua');
    }
  };

  // ── Delete user ──
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Yeh user permanently delete karna hai? (Auth record rahega)')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User delete ho gaya');
      fetchData();
    } catch {
      toast.error('Delete nahi hua');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'pending' as const, label: 'Pending Approvals', icon: <Clock size={16} />, count: pendingUsers.length, urgent: pendingUsers.length > 0 },
    { id: 'users' as const, label: 'Approved Users', icon: <CheckCircle size={16} />, count: approvedUsers.length, urgent: false },
    { id: 'screenshots' as const, label: 'Screenshots', icon: <ImageIcon size={16} />, count: screenshots.length, urgent: false },
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Admin Control</h1>
        <p className="text-muted-foreground">Users manage karo — approve karo, reject karo, history dekho.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="text-xs text-muted-foreground mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-400">{pendingUsers.length}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-muted-foreground mb-1">Approved Users</div>
          <div className="text-3xl font-bold text-secondary">{approvedUsers.length}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-muted-foreground mb-1">Screenshots</div>
          <div className="text-3xl font-bold text-foreground">{screenshots.length}</div>
        </div>
        <div className="glass-card p-5">
          <div className="text-xs text-muted-foreground mb-1">Recovery Mein</div>
          <div className="text-3xl font-bold text-destructive">
            {approvedUsers.filter(u => u.recoveryStatus).length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10'
            } ${tab.urgent ? 'ring-2 ring-yellow-500/50' : ''}`}
          >
            {tab.icon}
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === tab.id ? 'bg-white/20' : tab.urgent ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB: PENDING APPROVALS ── */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingUsers.length === 0 ? (
            <div className="glass-card p-12 text-center text-muted-foreground">
              <CheckCircle size={40} className="mx-auto mb-4 text-secondary/50" />
              <p className="font-medium">Koi pending request nahi!</p>
              <p className="text-sm mt-1">Sab users handle ho gaye hain.</p>
            </div>
          ) : (
            pendingUsers.map(u => (
              <div key={u.id} className={`glass-card p-6 border ${u.isRejected ? 'border-destructive/20' : u.gameUid ? 'border-yellow-500/30' : 'border-white/5'}`}>
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  {/* User info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="font-semibold text-foreground text-lg">{u.name}</div>
                      {u.isRejected && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                          Rejected
                        </span>
                      )}
                      {!u.isRejected && u.gameUid && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          UID Submitted
                        </span>
                      )}
                      {!u.gameUid && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                          UID Nahi Di
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                    {u.gameUid && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Game UID:</span>
                        <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg text-sm">
                          {u.gameUid}
                        </span>
                      </div>
                    )}
                    {u.joinDate && (
                      <div className="text-xs text-muted-foreground">
                        Joined: {format(u.joinDate.toDate?.() || new Date(u.joinDate), 'dd MMM yyyy, hh:mm a')}
                      </div>
                    )}
                    {u.isRejected && u.rejectionReason && (
                      <div className="text-xs text-destructive/80 bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2 mt-2">
                        ❌ Reject reason: {u.rejectionReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <Button
                      className="bg-secondary hover:bg-secondary/80 text-secondary-foreground gap-2"
                      onClick={() => handleApprove(u.id)}
                      disabled={!u.gameUid}
                      title={!u.gameUid ? 'User ne abhi UID submit nahi ki' : 'Approve karo'}
                    >
                      <CheckCircle size={16} />
                      Approve & Start Strategy
                    </Button>

                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Reject reason (optional)"
                        value={rejectReason[u.id] || ''}
                        onChange={e => setRejectReason(prev => ({ ...prev, [u.id]: e.target.value }))}
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-black/30 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-destructive/50"
                      />
                      <Button
                        variant="outline"
                        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
                        onClick={() => handleReject(u.id)}
                      >
                        <XCircle size={16} />
                        Reject
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive gap-1 text-xs"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      <Trash2 size={13} /> Delete Record
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB: APPROVED USERS ── */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden">
          {approvedUsers.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Koi approved user nahi hai abhi.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name / Email</th>
                    <th className="px-6 py-4 font-medium">Game UID</th>
                    <th className="px-6 py-4 font-medium">Day</th>
                    <th className="px-6 py-4 font-medium">Balance</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {approvedUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{u.name}</div>
                        <div className="text-muted-foreground text-xs">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-primary">{u.gameUid || '—'}</span>
                      </td>
                      <td className="px-6 py-4">{u.currentDay}/30</td>
                      <td className="px-6 py-4 font-mono">{u.currentCoins?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        {u.recoveryStatus ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                            Recovery
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleResetUser(u.id)}
                            title="Day 1 pe reset karo"
                          >
                            <RotateCcw size={16} />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SCREENSHOTS ── */}
      {activeTab === 'screenshots' && (
        <div className="glass-card overflow-hidden">
          {screenshots.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Koi screenshot nahi mili abhi.</div>
          ) : (
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
                  {screenshots.map(s => (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-medium text-foreground">{s.userName}</td>
                      <td className="px-6 py-4">Day {s.dayNumber}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {s.date ? format(s.date.toDate(), 'MMM d, hh:mm a') : 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={s.imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <ImageIcon size={16} /> View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
