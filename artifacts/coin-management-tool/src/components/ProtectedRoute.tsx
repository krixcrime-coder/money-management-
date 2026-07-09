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

  // Profile still loading or failed to fetch — block access
  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Admins always pass through (no approval required)
  if (userProfile.isAdmin) {
    return <>{children}</>;
  }

  // Not yet approved — send to pending page
  if (!userProfile.isApproved) {
    return <Redirect to="/pending" />;
  }

  return <>{children}</>;
}
