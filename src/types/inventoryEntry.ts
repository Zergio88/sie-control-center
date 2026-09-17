import type { Device } from '@/types/device';

/** One serial inside an inventory entry (POST /api/inventory-entries). */
export interface SerialNumberItemRequest {
  value: string;
  source: string;
  primary: boolean;
}

/** Request body of POST /api/inventory-entries — creates device + serials atomically. */
export interface InventoryEntryRequest {
  deviceTypeId: number;
  palletId: number;
  floorNumber: number;
  /** Free text (max 50), e.g. "available". */
  status: string;
  notes: string | null;
  serials: SerialNumberItemRequest[];
}

/** Mirrors the backend `SerialNumberResponse` DTO. */
export interface SerialNumber {
  id: number;
  deviceId: number;
  value: string;
  source: string;
  primary: boolean;
}

/** Response of POST /api/inventory-entries. */
export interface InventoryEntryResponse {
  device: Device;
  serials: SerialNumber[];
}
