/**
 * Mirrors the backend `ZoneResponse` DTO (GET/POST /api/zones). Unlike the
 * other catalog entities, the backend does not expose timestamps here.
 */
export interface Zone {
  id: number;
  name: string;
  description: string | null;
}

/** Request body of POST /api/zones. */
export interface CreateZoneRequest {
  name: string;
  description?: string | null;
}
