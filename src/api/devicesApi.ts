import { request } from '@/api/client';
import type { Device } from '@/types/device';

/** GET /api/devices — full inventory list (the backend has no pagination). */
function list(): Promise<Device[]> {
  return request<Device[]>('/api/devices');
}

export const devicesApi = { list };
