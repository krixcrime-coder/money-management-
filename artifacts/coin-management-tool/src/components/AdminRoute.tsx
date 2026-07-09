import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ADMIN_USER = 'radhaji';
const ADMIN_PASS = 'radhe';
const SESSION_KEY = 'coinmgmt_admin_ok';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'yes'
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]   = useState('');
  const [shake, setShake]   = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'yes');
      setAuthed(true);
    } else {
      setError('Username ya password galat hai');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className={`w-full max-w-sm glass-card p-8 relative z-10 transition-all ${shake ? 'translate-x-2' : ''}`}
        style={shake ? { animation: 'shake 0.4s ease' } : {}}>

        {/* Lock icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none"
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">Restricted area — credentials required</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); }}
            autoComplete="off"
            className="bg-black/20 border-white/10 h-12"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            className="bg-black/20 border-white/10 h-12"
          />
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          <Button type="submit" className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-bold mt-2">
            Enter Admin Panel
          </Button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}
