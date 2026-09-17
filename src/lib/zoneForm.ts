import { z } from 'zod';
import type { CreateZoneRequest } from '@/types/zone';

/**
 * Client-side validation for the zone create form. Optional free-text fields
 * are empty strings here (that is what native inputs produce); they become
 * null in {@link toCreateZoneRequest}.
 */
export const zoneFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres.').optional(),
});

export type ZoneFormValues = z.infer<typeof zoneFormSchema>;

export const DEFAULT_ZONE_VALUES: ZoneFormValues = {
  name: '',
  description: '',
};

/** Converts validated form values into the backend request shape. */
export function toCreateZoneRequest(values: ZoneFormValues): CreateZoneRequest {
  return {
    name: values.name,
    description: values.description?.trim() || null,
  };
}
