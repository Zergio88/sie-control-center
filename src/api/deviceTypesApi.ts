import { request } from '@/api/client';
import type { CreateDeviceTypeRequest, DeviceType } from '@/types/deviceType';

/** GET /api/device-types — full catalog list (no pagination). */
function list(): Promise<DeviceType[]> {
  return request<DeviceType[]>('/api/device-types');
}

/** POST /api/device-types — creates a catalog device type. */
function create(body: CreateDeviceTypeRequest): Promise<DeviceType> {
  return request<DeviceType>('/api/device-types', { method: 'POST', body });
}

/** DELETE /api/device-types/{id} — ADMIN only; 409 while devices reference it. */
function remove(id: number): Promise<void> {
  return request<void>(`/api/device-types/${id}`, { method: 'DELETE' });
}

export const deviceTypesApi = { list, create, remove };
