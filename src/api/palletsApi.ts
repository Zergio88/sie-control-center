import { request } from '@/api/client';
import type { CreatePalletRequest, Pallet } from '@/types/pallet';

/** GET /api/pallets — full catalog list (no pagination). */
function list(): Promise<Pallet[]> {
  return request<Pallet[]>('/api/pallets');
}

/** POST /api/pallets — creates a catalog pallet. */
function create(body: CreatePalletRequest): Promise<Pallet> {
  return request<Pallet>('/api/pallets', { method: 'POST', body });
}

/** DELETE /api/pallets/{id} — ADMIN only; 409 while devices reference it. */
function remove(id: number): Promise<void> {
  return request<void>(`/api/pallets/${id}`, { method: 'DELETE' });
}

export const palletsApi = { list, create, remove };
