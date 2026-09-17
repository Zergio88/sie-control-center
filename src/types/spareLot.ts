/**
 * Mirrors the backend `SpareLotResponse` DTO (GET/POST /api/spare-lots).
 * `deviceName` is the joined device-type name (backend field name) and
 * `locationName` likewise; both can be null when the referenced catalog entry
 * was deleted.
 */
export interface SpareLot {
  id: number;
  deviceTypeId: number | null;
  deviceName: string | null;
  locationId: number | null;
  locationName: string | null;
  quantity: number;
  unit: string;
  status: string;
  notes: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Request body of POST /api/spare-lots. */
export interface CreateSpareLotRequest {
  deviceTypeId: number;
  locationId: number;
  quantity: number;
  unit: string;
  status: string;
  notes?: string | null;
}
