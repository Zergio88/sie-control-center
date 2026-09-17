import { request } from '@/api/client';
import type { DeviceType } from '@/types/deviceType';

/** GET /api/device-types — full catalog list (no pagination). */
function list(): Promise<DeviceType[]> {
  return request<DeviceType[]>('/api/device-types');
}

export const deviceTypesApi = { list };
