import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, authenticateLDAP, getStoredUser, storeUser, clearUser } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (employeeId: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (employeeId: string, password: string) => {
    const result = await authenticateLDAP(employeeId, password);
    if (result) {
      setUser(result);
      storeUser(result);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
