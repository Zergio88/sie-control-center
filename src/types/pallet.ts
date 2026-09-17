/**
 * Mirrors the backend `PalletResponse` DTO (GET/POST /api/pallets).
 * `locationName` is joined by the backend and can be null when the location
 * was deleted. `maxFloors` caps how many floors a loaded pallet can hold.
 */
export interface Pallet {
  id: number;
  locationId: number | null;
  locationName: string | null;
  code: string;
  maxFloors: number | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Request body of POST /api/pallets. `locationId` and `maxFloors` are required. */
export interface CreatePalletRequest {
  locationId: number;
  code: string;
  maxFloors: number;
  notes?: string | null;
}
