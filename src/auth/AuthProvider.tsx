import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '@/api/authApi';
import { AUTH_LOST_EVENT } from '@/api/client';
import { clearSession, loadSession, saveSession } from '@/lib/tokenStorage';
import type { AuthSession } from '@/types/auth';
import { AuthContext } from '@/auth/context';
import type { AuthContextValue } from '@/auth/context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());

  useEffect(() => {
    const handleAuthLost = (): void => setSession(null);
    window.addEventListener(AUTH_LOST_EVENT, handleAuthLost);
    return () => window.removeEventListener(AUTH_LOST_EVENT, handleAuthLost);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthSession> => {
    const auth = await authApi.login({ email, password });
    saveSession(auth);
    setSession(auth);
    return auth;
  }, []);

  const logout = useCallback((): void => {
    clearSession();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      role: session?.role ?? null,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
