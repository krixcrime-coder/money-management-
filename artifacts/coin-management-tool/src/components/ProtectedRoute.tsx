import React from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (userProfile && !userProfile.setupComplete && location !== '/setup') {
    return <Redirect to="/setup" />;
  }

  return <>{children}</>;
}
