/**
 * Mirrors the backend `DeviceTypeResponse` DTO (GET/POST /api/device-types).
 * Dates arrive as ISO-8601 strings.
 */
export interface DeviceType {
  id: number;
  name: string;
  brand: string | null;
  model: string | null;
  category: string | null;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
