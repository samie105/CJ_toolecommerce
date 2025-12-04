'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAdminSession, logoutAdmin, AdminData } from '@/lib/auth';

interface AdminContextType {
  admin: AdminData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshSession: () => void;
}

const AdminContext = React.createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = React.useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshSession = React.useCallback(() => {
    const session = getAdminSession();
    if (session) {
      setAdmin(session.admin);
    } else {
      setAdmin(null);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    refreshSession();
  }, [refreshSession, pathname]);

  const logout = React.useCallback(() => {
    logoutAdmin();
    setAdmin(null);
    router.push('/admin-login');
  }, [router]);

  const value = React.useMemo(() => ({
    admin,
    isLoading,
    isAuthenticated: !!admin,
    logout,
    refreshSession,
  }), [admin, isLoading, logout, refreshSession]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = React.useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
