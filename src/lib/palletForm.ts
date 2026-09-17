import { z } from 'zod';
import type { CreatePalletRequest } from '@/types/pallet';

/**
 * Client-side validation for the pallet create form. The backend requires
 * `locationId` and `maxFloors` (400 otherwise); `code` is limited to 50 chars.
 */
export const palletFormSchema = z.object({
  locationId: z.string().min(1, 'Selecciona una ubicación.'),
  code: z.string().trim().min(1, 'El código es obligatorio.').max(50, 'Máximo 50 caracteres.'),
  maxFloors: z
    .string()
    .trim()
    .refine((value) => value !== '' && Number.isInteger(Number(value)) && Number(value) >= 1, {
      message: 'Debe ser un número entero mayor o igual a 1.',
    }),
  notes: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
});

export type PalletFormValues = z.infer<typeof palletFormSchema>;

export const DEFAULT_PALLET_VALUES: PalletFormValues = {
  locationId: '',
  code: '',
  maxFloors: '',
  notes: '',
};

/** Converts validated form values into the backend request shape. */
export function toCreatePalletRequest(values: PalletFormValues): CreatePalletRequest {
  return {
    locationId: Number(values.locationId),
    code: values.code,
    maxFloors: Number(values.maxFloors),
    notes: values.notes?.trim() || null,
  };
}
