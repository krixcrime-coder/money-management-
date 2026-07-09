import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !userProfile?.isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}
