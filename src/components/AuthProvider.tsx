'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isLoggedIn, getCurrentUser, logout } from '@/lib/auth';
import { loadUserData, saveUserData } from '@/store/useStore';

interface AuthContextType {
  user: string | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u && !initialized) {
      loadUserData();
      setInitialized(true);
    }
    setLoading(false);
  }, [initialized]);

  function signOut() {
    saveUserData(); // persist current store to user-scoped key before logout
    logout();
    setUser(null);
    // Reload to reset the store
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
