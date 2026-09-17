import { request } from '@/api/client';
import type { CreateSpareLotRequest, SpareLot } from '@/types/spareLot';

/** GET /api/spare-lots — full catalog list (no pagination). */
function list(): Promise<SpareLot[]> {
  return request<SpareLot[]>('/api/spare-lots');
}

/** POST /api/spare-lots — creates a spare-lot catalog entry. */
function create(body: CreateSpareLotRequest): Promise<SpareLot> {
  return request<SpareLot>('/api/spare-lots', { method: 'POST', body });
}

/** DELETE /api/spare-lots/{id} — ADMIN only. */
function remove(id: number): Promise<void> {
  return request<void>(`/api/spare-lots/${id}`, { method: 'DELETE' });
}

export const spareLotsApi = { list, create, remove };
