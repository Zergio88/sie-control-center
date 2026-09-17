import { request } from '@/api/client';
import type { CreateLocationRequest, Location } from '@/types/location';

/** GET /api/locations — full catalog list (no pagination). */
function list(): Promise<Location[]> {
  return request<Location[]>('/api/locations');
}

/** POST /api/locations — creates a catalog location. */
function create(body: CreateLocationRequest): Promise<Location> {
  return request<Location>('/api/locations', { method: 'POST', body });
}

/** DELETE /api/locations/{id} — ADMIN only; 409 when the location still has pallets. */
function remove(id: number): Promise<void> {
  return request<void>(`/api/locations/${id}`, { method: 'DELETE' });
}

export const locationsApi = { list, create, remove };
