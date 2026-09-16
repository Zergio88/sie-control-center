/**
 * Mirrors the backend `DeviceResponse` DTO (GET/POST /api/devices).
 * Dates arrive as ISO-8601 strings; `deviceTypeName`/`palletCode` are joined
 * by the backend and can be null when the reference was deleted.
 */
export interface Device {
  id: number;
  deviceTypeId: number | null;
  deviceTypeName: string | null;
  palletId: number | null;
  palletCode: string | null;
  floorNumber: number | null;
  /** Free text (max 50), e.g. "available". */
  status: string;
  notes: string | null;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}
