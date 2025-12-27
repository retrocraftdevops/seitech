'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { refreshUser, isLoading } = useAuthStore();

  useEffect(() => {
    // Restore session from cookies on app load
    refreshUser();
  }, [refreshUser]);

  return <>{children}</>;
}
