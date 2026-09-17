import { z } from 'zod';
import type { CreateLocationRequest } from '@/types/location';

/**
 * Client-side validation for the location create form. Field values are
 * strings (native selects/inputs). The backend requires `zoneId` and
 * `locationType` (400 otherwise), so both are enforced here.
 */
export const locationFormSchema = z.object({
  zoneId: z.string().min(1, 'Selecciona una zona.'),
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  locationType: z
    .string()
    .trim()
    .min(1, 'El tipo es obligatorio.')
    .max(50, 'Máximo 50 caracteres.'),
  notes: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

export const DEFAULT_LOCATION_VALUES: LocationFormValues = {
  zoneId: '',
  name: '',
  locationType: '',
  notes: '',
};

/** Converts validated form values into the backend request shape. */
export function toCreateLocationRequest(values: LocationFormValues): CreateLocationRequest {
  return {
    zoneId: Number(values.zoneId),
    name: values.name,
    locationType: values.locationType,
    notes: values.notes?.trim() || null,
  };
}
