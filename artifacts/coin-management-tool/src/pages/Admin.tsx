import React, { useEffect, useState } from 'react';
import {
  collection, query, getDocs, orderBy, deleteDoc,
  doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAppSettings, updateAppSettings } from '../lib/settings';
import { Layout } from '../components/Layout';
import { format } from 'date-fns';
import { Trash2, RotateCcw, Image as ImageIcon, CheckCircle, XCircle, Clock, Users, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
  isApproved?: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
  gameUid?: string;
  joinDate?: { toDate?: () => Date } | string | number | null;
  currentDay?: number;
  currentCoins?: number;
  recoveryStatus?: boolean;
}

interface AdminScreenshot {
  id: string;
  userName?: string;
  dayNumber?: number;
  date?: { toDate: () => Date };
  imageUrl?: string;
}

export default function Admin() {
  const [pendingUsers, setPendingUsers] = useState<AdminUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<AdminUser[]>([]);
  const [screenshots, setScreenshots] = useState<AdminScreenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'screenshots' | 'settings'>('pending');
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [referralLink, setReferralLink] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const uq = query(collection(db, 'users'), orderBy('joinDate', 'desc'));
      const uSnap = await getDocs(uq);
      const allUsers: AdminUser[] = [];
      uSnap.forEach((d) => allUsers.push({ id: d.id, ...d.data() } as AdminUser));

      setPendingUsers(allUsers.filter(u => !u.isAdmin && !u.isApproved));
      setApprovedUsers(allUsers.filter(u => !u.isAdmin && u.isApproved));

      const sq = query(collection(db, 'screenshots'), orderBy('date', 'desc'));
      const sSnap = await getDocs(sq);
      const sData: AdminScreenshot[] = [];
      sSnap.forEach((d) => sData.push({ id: d.id, ...d.data() } as AdminScreenshot));
      setScreenshots(sData);

      const settings = await getAppSettings();
      setReferralLink(settings.referralLink);
    } catch (error) {
      console.error('Admin fetch error', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSettings = async () => {
    if (!referralLink.trim()) {
      toast.error('Referral link cannot be empty');
      return;
    }
    setSavingSettings(true);
    try {
      await updateAppSettings({ referralLink: referralLink.trim() });
      toast.success('Settings saved');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

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
      toast.success('User approved! Strategy has started.');
      fetchData();
    } catch {
      toast.error('Approval failed');
    }
  };

  // ── Reject user ──
  const handleReject = async (userId: string) => {
    const reason = rejectReason[userId] ||
      'You did not register in the game through our referral link. Please do that first, then submit your UID again.';
    try {
      await updateDoc(doc(db, 'users', userId), {
        isRejected: true,
        isApproved: false,
        rejectionReason: reason,
      });
      toast.success('User rejected. They have been notified.');
      fetchData();
    } catch {
      toast.error('Rejection failed');
    }
  };

  // ── Reset user ──
  const handleResetUser = async (userId: string) => {
    if (!confirm('Reset this user back to Day 1?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        currentDay: 1,
        currentCoins: 100,
        recoveryStatus: false,
        monthStartDate: serverTimestamp(),
      });
      toast.success('User reset');
      fetchData();
    } catch {
      toast.error('Reset failed');
    }
  };

  // ── Delete user ──
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Permanently delete this user? (Their auth record will remain)')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
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
    { id: 'settings' as const, label: 'Settings', icon: <SettingsIcon size={16} />, count: 0, urgent: false },
  ];

  const totalUsers = pendingUsers.length + approvedUsers.length;

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Admin Control</h1>
        <p className="text-muted-foreground">Manage users — approve, reject, and review history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Users size={12} /> Total Users</div>
          <div className="text-3xl font-bold text-primary">{totalUsers}</div>
        </div>
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
          <div className="text-xs text-muted-foreground mb-1">In Recovery</div>
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
              <p className="font-medium">No pending requests!</p>
              <p className="text-sm mt-1">All users have been handled.</p>
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
                          No UID Yet
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
                        Joined: {format(
                          typeof u.joinDate === 'object' && u.joinDate.toDate
                            ? u.joinDate.toDate()
                            : new Date(u.joinDate as string | number),
                          'dd MMM yyyy, hh:mm a'
                        )}
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
                      title={!u.gameUid ? 'User has not submitted a UID yet' : 'Approve'}
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
            <div className="p-12 text-center text-muted-foreground">No approved users yet.</div>
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
                            title="Reset to Day 1"
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
            <div className="p-12 text-center text-muted-foreground">No screenshots found yet.</div>
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

      {/* ── TAB: SETTINGS ── */}
      {activeTab === 'settings' && (
        <div className="glass-card p-6 max-w-xl">
          <h3 className="font-semibold text-foreground mb-1">Game Referral Link</h3>
          <p className="text-muted-foreground text-sm mb-4">
            This is the link shown to users on the approval page and used to join the game. Update it any time — changes apply immediately for all users.
          </p>
          <div className="flex gap-3">
            <Input
              value={referralLink}
              onChange={e => setReferralLink(e.target.value)}
              placeholder="https://your-game-link.com"
              className="bg-black/20 border-white/10 flex-1 font-mono text-sm"
            />
            <Button onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}
