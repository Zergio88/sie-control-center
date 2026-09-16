import { createContext } from 'react';
import type { AuthSession, UserRole } from '@/types/auth';

export interface AuthContextValue {
  session: AuthSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
