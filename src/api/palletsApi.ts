import { request } from '@/api/client';
import type { Pallet } from '@/types/pallet';

/** GET /api/pallets — full catalog list (no pagination). */
function list(): Promise<Pallet[]> {
  return request<Pallet[]>('/api/pallets');
}

export const palletsApi = { list };
