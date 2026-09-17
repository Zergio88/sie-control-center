import { z } from 'zod';
import type { CreateDeviceTypeRequest } from '@/types/deviceType';

/**
 * Client-side validation for the device-type create form. `name` and
 * `category` are required on the backend (400 otherwise); the rest are
 * optional free-text fields.
 */
export const deviceTypeFormSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio.').max(100, 'Máximo 100 caracteres.'),
  brand: z.string().trim().max(100, 'Máximo 100 caracteres.').optional(),
  model: z.string().trim().max(100, 'Máximo 100 caracteres.').optional(),
  category: z
    .string()
    .trim()
    .min(1, 'La categoría es obligatoria.')
    .max(50, 'Máximo 50 caracteres.'),
  description: z.string().trim().max(500, 'Máximo 500 caracteres.').optional(),
});

export type DeviceTypeFormValues = z.infer<typeof deviceTypeFormSchema>;

export const DEFAULT_DEVICE_TYPE_VALUES: DeviceTypeFormValues = {
  name: '',
  brand: '',
  model: '',
  category: '',
  description: '',
};

/** Converts validated form values into the backend request shape. */
export function toCreateDeviceTypeRequest(values: DeviceTypeFormValues): CreateDeviceTypeRequest {
  return {
    name: values.name,
    brand: values.brand?.trim() || null,
    model: values.model?.trim() || null,
    category: values.category,
    description: values.description?.trim() || null,
  };
}
