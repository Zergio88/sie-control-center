import { z } from 'zod';
import type { CreateSpareLotRequest } from '@/types/spareLot';

/**
 * Client-side validation for the spare-lot create form. Foreign keys are
 * required selects; `quantity` is a positive integer; `status` defaults to
 * 'available' like the backend.
 */
export const spareLotFormSchema = z.object({
  deviceTypeId: z.string().min(1, 'Selecciona un modelo.'),
  locationId: z.string().min(1, 'Selecciona una ubicación.'),
  quantity: z
    .string()
    .trim()
    .refine((value) => value !== '' && Number.isInteger(Number(value)) && Number(value) >= 1, {
      message: 'La cantidad debe ser un número entero mayor o igual a 1.',
    }),
  unit: z.string().trim().min(1, 'La unidad es obligatoria.').max(200, 'Máximo 200 caracteres.'),
  status: z.string().trim().min(1, 'El estado es obligatorio.').max(200, 'Máximo 200 caracteres.'),
  notes: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
});

export type SpareLotFormValues = z.infer<typeof spareLotFormSchema>;

export const DEFAULT_SPARE_LOT_VALUES: SpareLotFormValues = {
  deviceTypeId: '',
  locationId: '',
  quantity: '',
  unit: 'unidad',
  status: 'available',
  notes: '',
};

/** Converts validated form values into the backend request shape. */
export function toCreateSpareLotRequest(values: SpareLotFormValues): CreateSpareLotRequest {
  return {
    deviceTypeId: Number(values.deviceTypeId),
    locationId: Number(values.locationId),
    quantity: Number(values.quantity),
    unit: values.unit,
    status: values.status,
    notes: values.notes?.trim() || null,
  };
}
