import React, { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const { resetPassword } = useAuth();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error('Failed to send reset email', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reset Password</h1>
          <p className="text-muted-foreground mt-2 text-sm">Enter your email to receive a reset link.</p>
        </div>

        {!isSent ? (
          <form onSubmit={handleReset} className="space-y-4">
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
            
            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-secondary/20 text-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p className="text-foreground font-medium mb-2">Check your email</p>
            <p className="text-muted-foreground text-sm">We've sent a password reset link to {email}</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm">
          <Link href="/">
            <span className="text-primary hover:underline cursor-pointer">Return to login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
