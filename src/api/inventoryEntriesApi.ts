import { request } from '@/api/client';
import type { InventoryEntryRequest, InventoryEntryResponse } from '@/types/inventoryEntry';

/**
 * POST /api/inventory-entries — creates a device plus its 1..n serial numbers
 * atomically. Available to ADMIN and OPERATOR. 409 when a serial value already
 * exists or the device already has a primary serial.
 */
function create(body: InventoryEntryRequest): Promise<InventoryEntryResponse> {
  return request<InventoryEntryResponse>('/api/inventory-entries', { method: 'POST', body });
}

export const inventoryEntriesApi = { create };
