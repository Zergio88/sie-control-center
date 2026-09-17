import { request } from '@/api/client';
import type { Device } from '@/types/device';

/** GET /api/devices — full inventory list (the backend has no pagination). */
function list(): Promise<Device[]> {
  return request<Device[]>('/api/devices');
}

/** GET /api/devices/{id} — single device (used by the serial search result). */
function getById(id: number): Promise<Device> {
  return request<Device>(`/api/devices/${id}`);
}

export const devicesApi = { list, getById };
