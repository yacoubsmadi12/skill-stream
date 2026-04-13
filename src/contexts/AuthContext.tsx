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

async function upsertProfile(user: AuthUser) {
  try {
    await fetch('/api/profiles/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        name: user.name,
        department: user.department,
      }),
    });
  } catch {
    // non-critical
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored) upsertProfile(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (employeeId: string, password: string) => {
    const result = await authenticateLDAP(employeeId, password);
    if (result) {
      setUser(result);
      storeUser(result);
      await upsertProfile(result);
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
