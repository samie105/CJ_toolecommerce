'use client';

import * as React from 'react';
import { Customer } from '@/lib/actions/auth';

interface AuthContextType {
  user: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: Customer | null) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<Customer | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Initialize from localStorage
  React.useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const authStatus = localStorage.getItem('aresdiamondtools-auth');
        const userData = localStorage.getItem('aresdiamondtools-user');
        
        if (authStatus === 'true' && userData) {
          try {
            setUser(JSON.parse(userData));
          } catch (e) {
            console.error('Failed to parse user data:', e);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('aresdiamondtools-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('aresdiamondtools-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const logout = React.useCallback(async () => {
    try {
      // Call server action to clear cookies
      const { logoutUser } = await import('@/lib/actions/auth');
      await logoutUser();
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aresdiamondtools-auth');
        localStorage.removeItem('aresdiamondtools-user');
        window.dispatchEvent(new Event('aresdiamondtools-auth-change'));
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      const { refreshUserData } = await import('@/lib/actions/user');
      const updatedUser = await refreshUserData();
      
      if (updatedUser) {
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aresdiamondtools-user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      setUser,
      logout,
      refreshUser,
    }),
    [user, isLoading, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
