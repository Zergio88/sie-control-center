import type { AuthSession, UserRole } from '@/types/auth';

const STORAGE_KEY = 'sie.auth';

const ROLES: readonly UserRole[] = ['ADMIN', 'OPERATOR'];

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Record<string, unknown>;
  return (
    typeof session.token === 'string' &&
    session.token.length > 0 &&
    typeof session.email === 'string' &&
    session.email.length > 0 &&
    typeof session.role === 'string' &&
    ROLES.includes(session.role as UserRole)
  );
}

/** Reads and validates the persisted session; discards corrupted values. */
export function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isAuthSession(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Sync access to the token for the API client (outside React). */
export function getStoredToken(): string | null {
  return loadSession()?.token ?? null;
}
