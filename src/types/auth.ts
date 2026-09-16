export type UserRole = 'ADMIN' | 'OPERATOR';

/** Response of POST /api/auth/login (and /api/auth/register). */
export interface AuthResponse {
  token: string;
  email: string;
  role: UserRole;
}

/** Session persisted locally so the app can restore auth on reload. */
export interface AuthSession extends AuthResponse {}

/** Normalized error thrown by the API client. status 0 = network failure. */
export interface ApiError {
  status: number;
  message: string;
}
