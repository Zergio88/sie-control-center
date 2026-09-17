import { z } from 'zod';
import type { InventoryEntryRequest } from '@/types/inventoryEntry';

/**
 * Client-side validation for the inventory-entry form. Field values here are
 * strings (that is what uncontrolled inputs/native selects produce); they are
 * converted to the numeric API types in {@link toInventoryEntryRequest}.
 * Limits mirror the backend DTOs (InventoryEntryRequest / SerialNumberItemRequest).
 */
export const inventoryEntryFormSchema = z
  .object({
    deviceTypeId: z.string().min(1, 'Selecciona un modelo.'),
    palletId: z.string().min(1, 'Selecciona un pallet.'),
    floorNumber: z
      .string()
      .refine(
        (value) => value.trim() !== '' && Number.isInteger(Number(value)) && Number(value) >= 1,
        { message: 'El piso debe ser un número entero mayor o igual a 1.' },
      ),
    status: z.string().trim().min(1, 'El estado es obligatorio.').max(50, 'Máximo 50 caracteres.'),
    notes: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
    serials: z
      .array(
        z.object({
          value: z
            .string()
            .trim()
            .min(1, 'El número de serie es obligatorio.')
            .max(100, 'Máximo 100 caracteres.'),
          source: z
            .string()
            .trim()
            .min(1, 'La fuente es obligatoria.')
            .max(50, 'Máximo 50 caracteres.'),
          primary: z.boolean(),
        }),
      )
      .min(1, 'Agrega al menos un número de serie.'),
  })
  .superRefine((data, context) => {
    // Serial values are globally unique in the DB; catch duplicates within the
    // same payload here so the backend 409 is the exception, not the rule.
    const seen = new Map<string, number>();
    data.serials.forEach((serial, index) => {
      const normalized = serial.value.trim().toLowerCase();
      const firstIndex = seen.get(normalized);
      if (firstIndex !== undefined) {
        context.addIssue({
          code: 'custom',
          message: 'El número de serie ya fue ingresado.',
          path: ['serials', index, 'value'],
        });
      } else {
        seen.set(normalized, index);
      }
    });
  });

export type InventoryEntryFormValues = z.infer<typeof inventoryEntryFormSchema>;

/** Initial form values. `status` defaults to 'available' like the backend. */
export const DEFAULT_INVENTORY_VALUES: InventoryEntryFormValues = {
  deviceTypeId: '',
  palletId: '',
  floorNumber: '',
  status: 'available',
  notes: '',
  serials: [{ value: '', source: '', primary: true }],
};

/** Converts validated form values into the backend request shape. */
export function toInventoryEntryRequest(values: InventoryEntryFormValues): InventoryEntryRequest {
  return {
    deviceTypeId: Number(values.deviceTypeId),
    palletId: Number(values.palletId),
    floorNumber: Number(values.floorNumber),
    status: values.status,
    notes: values.notes?.trim() || null,
    serials: values.serials.map((serial) => ({
      value: serial.value,
      source: serial.source,
      primary: serial.primary,
    })),
  };
}
