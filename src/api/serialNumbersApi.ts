import { request } from '@/api/client';
import type { SerialNumber } from '@/types/inventoryEntry';

/**
 * GET /api/serial-numbers/search?value=… → the matching serial or 404. The
 * backend resolves by exact value and returns a single object, so a missing
 * serial surfaces as `ApiError { status: 404 }`.
 */
function search(value: string): Promise<SerialNumber> {
  return request<SerialNumber>('/api/serial-numbers/search', { params: { value } });
}

export const serialNumbersApi = { search };
