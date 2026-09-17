import type { UserRole } from '@/types/auth';

/** Mirrors the backend `UserResponse` DTO (GET/POST/PATCH /api/users). */
export interface User {
  id: number;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Request body of POST /api/users (same shape as POST /api/auth/register). */
export interface CreateUserRequest {
  email: string;
  password: string;
  role: UserRole;
}
