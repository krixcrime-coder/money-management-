import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      // Wait a tick for auth state to propagate and user profile to fetch
      setTimeout(() => {
        setLocation('/dashboard');
      }, 500);
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials and try again.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full bg-primary animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.5)]"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">COINMGMT</h1>
          <p className="text-muted-foreground mt-2 text-center">Discipline over emotion.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/20 border-white/10 h-12"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/20 border-white/10 h-12"
            />
            <div className="flex justify-end">
              <Link href="/forgot-password">
                <span className="text-xs text-primary hover:underline cursor-pointer">Forgot password?</span>
              </Link>
            </div>
          </div>
          
          <Button type="submit" className="w-full h-12 text-md mt-4" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register">
            <span className="text-primary hover:underline cursor-pointer font-medium">Register here</span>
          </Link>
        </div>
      </div>
      
      <div className="mt-12 text-center max-w-md text-xs text-muted-foreground/50 px-4">
        ⚠️ This application does NOT predict game results. Every game outcome is random. This tool is only for coin management and discipline.
      </div>
    </div>
  );
}
