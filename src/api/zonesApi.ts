import { request } from '@/api/client';
import type { CreateZoneRequest, Zone } from '@/types/zone';

/** GET /api/zones — full catalog list (no pagination). */
function list(): Promise<Zone[]> {
  return request<Zone[]>('/api/zones');
}

/** POST /api/zones — creates a catalog zone. */
function create(body: CreateZoneRequest): Promise<Zone> {
  return request<Zone>('/api/zones', { method: 'POST', body });
}

/** DELETE /api/zones/{id} — ADMIN only; 409 when the zone still has locations. */
function remove(id: number): Promise<void> {
  return request<void>(`/api/zones/${id}`, { method: 'DELETE' });
}

export const zonesApi = { list, create, remove };
