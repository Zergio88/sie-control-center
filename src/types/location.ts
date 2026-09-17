/**
 * Mirrors the backend `LocationResponse` DTO (GET/POST /api/locations).
 * `zoneName` is joined by the backend and can be null when the zone was
 * deleted. Unlike the other catalog entities, the backend does not expose
 * timestamps here.
 */
export interface Location {
  id: number;
  zoneId: number | null;
  zoneName: string | null;
  name: string;
  locationType: string | null;
  notes: string | null;
}

/** Request body of POST /api/locations. `zoneId` is required. */
export interface CreateLocationRequest {
  zoneId: number;
  name: string;
  locationType: string;
  notes?: string | null;
}
