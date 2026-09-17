import { request } from '@/api/client';
import type { CreateUserRequest, User } from '@/types/user';

/** GET /api/users — full list (no pagination). ADMIN only. */
function list(): Promise<User[]> {
  return request<User[]>('/api/users');
}

/** POST /api/users — creates a user (409 when the email already exists). */
function create(body: CreateUserRequest): Promise<User> {
  return request<User>('/api/users', { method: 'POST', body });
}

/** PATCH /api/users/{id}/active — 400 on self-deactivation, 409 on last admin. */
function setActive(id: number, active: boolean): Promise<User> {
  return request<User>(`/api/users/${id}/active`, { method: 'PATCH', body: { active } });
}

/** PATCH /api/users/{id}/role — 400 on self-demotion, 409 on last admin. */
function setRole(id: number, role: CreateUserRequest['role']): Promise<User> {
  return request<User>(`/api/users/${id}/role`, { method: 'PATCH', body: { role } });
}

export const usersApi = { list, create, setActive, setRole };
