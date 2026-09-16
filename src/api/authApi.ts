import { request } from '@/api/client';
import type { AuthResponse } from '@/types/auth';

export interface LoginInput {
  email: string;
  password: string;
}

/** POST /api/auth/login — public, no token attached. */
export function login(input: LoginInput): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', { method: 'POST', body: input, auth: false });
}

export const authApi = { login };
