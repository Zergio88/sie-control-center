import { useCallback, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { ErrorState } from '@/components/ui/ErrorState';
import { useCreateInventoryEntry } from '@/hooks/useCreateInventoryEntry';
import { useDeviceTypes } from '@/hooks/useDeviceTypes';
import { usePallets } from '@/hooks/usePallets';
import { mapApiMessage } from '@/lib/apiMessages';
import {
  DEFAULT_INVENTORY_VALUES,
  inventoryEntryFormSchema,
  toInventoryEntryRequest,
} from '@/lib/inventoryEntryForm';
import type { InventoryEntryFormValues } from '@/lib/inventoryEntryForm';

const STATUS_PLACEHOLDER = 'Ej: available, in-use, maintenance';

function deviceTypeLabel(deviceType: {
  name: string;
  brand: string | null;
  model: string | null;
}): string {
  const parts = [deviceType.name];
  if (deviceType.brand) parts.push(deviceType.brand);
  if (deviceType.model) parts.push(deviceType.model);
  return parts.join(' · ');
}

export function InventoryEntryPage() {
  const deviceTypes = useDeviceTypes();
  const pallets = usePallets();
  const createEntry = useCreateInventoryEntry();
  const isPending = createEntry.isPending;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToastMessage(null), []);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<InventoryEntryFormValues>({
    resolver: zodResolver(inventoryEntryFormSchema),
    defaultValues: DEFAULT_INVENTORY_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'serials' });
  const serialValueRefs = useRef<Array<HTMLInputElement | null>>([]);

  const appendSerial = useCallback(() => {
    const nextIndex = fields.length;
    append({ value: '', source: '', primary: false });
    window.setTimeout(() => serialValueRefs.current[nextIndex]?.focus(), 0);
  }, [append, fields.length]);

  const handleSerialEnter = useCallback(
    (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      const nextIndex = index + 1;
      if (fields[nextIndex]) {
        serialValueRefs.current[nextIndex]?.focus();
      } else {
        appendSerial();
      }
    },
    [fields, appendSerial],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (isPending) return;
    setSubmitError(null);
    setToastMessage(null);
    try {
      await createEntry.mutateAsync(toInventoryEntryRequest(values));
      setToastMessage('Inventario guardado correctamente.');
      reset(DEFAULT_INVENTORY_VALUES);
      window.setTimeout(() => serialValueRefs.current[0]?.focus(), 0);
    } catch (error) {
      setSubmitError(mapApiMessage(error));
    }
  });

  if (deviceTypes.isPending || pallets.isPending) {
    return (
      <section>
        <PageHeader />
        <div className="mt-6 flex max-w-3xl items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
          <Spinner label="Cargando catálogo" />
          <p className="text-sm text-ink-muted">Cargando modelos y pallets…</p>
        </div>
      </section>
    );
  }

  if (deviceTypes.isError || pallets.isError) {
    return (
      <section>
        <PageHeader />
        <div className="mt-6 max-w-3xl">
          <ErrorState
            message={mapApiMessage(deviceTypes.error ?? pallets.error)}
            onRetry={() => {
              void deviceTypes.refetch();
              void pallets.refetch();
            }}
          />
        </div>
      </section>
    );
  }

  const selectedPallet = pallets.data.find((pallet) => pallet.id === Number(watch('palletId')));
  const noModels = deviceTypes.data.length === 0;
  const noPallets = pallets.data.length === 0;
  const catalogEmpty = noModels || noPallets;

  return (
    <section>
      <PageHeader />

      <form onSubmit={onSubmit} className="mt-6 max-w-3xl space-y-6" noValidate>
        {submitError && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger"
          >
            {submitError}
          </div>
        )}

        <fieldset disabled={isPending} className="space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Modelo"
                {...register('deviceTypeId')}
                error={errors.deviceTypeId?.message}
              >
                <option value="">— Seleccionar —</option>
                {deviceTypes.data.map((deviceType) => (
                  <option key={deviceType.id} value={deviceType.id}>
                    {deviceTypeLabel(deviceType)}
                  </option>
                ))}
              </Select>
              <Select label="Pallet" {...register('palletId')} error={errors.palletId?.message}>
                <option value="">— Seleccionar —</option>
                {pallets.data.map((pallet) => (
                  <option key={pallet.id} value={pallet.id}>
                    {pallet.code}
                    {pallet.locationName ? ` · ${pallet.locationName}` : ''}
                    {pallet.maxFloors ? ` (${pallet.maxFloors} pisos)` : ''}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                label="Piso"
                placeholder="1"
                {...register('floorNumber')}
                error={errors.floorNumber?.message}
                hint={
                  selectedPallet?.maxFloors
                    ? `El pallet soporta hasta ${selectedPallet.maxFloors} pisos.`
                    : undefined
                }
              />
              <Input
                label="Estado"
                placeholder={STATUS_PLACEHOLDER}
                {...register('status')}
                error={errors.status?.message}
              />
              <Input
                label="Notas"
                placeholder="Opcional"
                {...register('notes')}
                error={errors.notes?.message}
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Números de serie</h2>
              <Button variant="secondary" onClick={appendSerial}>
                + Agregar serial
              </Button>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Presiona Enter sobre el número de serie para continuar con el siguiente.
            </p>

            {fields.length === 0 ? (
              <p role="alert" className="field-error mt-4">
                Agrega al menos un número de serie.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:items-end"
                  >
                    <Input
                      {...register(`serials.${index}.value`)}
                      ref={(node) => {
                        register(`serials.${index}.value`).ref(node);
                        serialValueRefs.current[index] = node;
                      }}
                      label={`Nro. de serie ${index + 1}`}
                      placeholder="Escanee o escriba el serial"
                      autoComplete="off"
                      autoFocus={index === 0}
                      onKeyDown={handleSerialEnter(index)}
                      error={errors.serials?.[index]?.value?.message}
                    />
                    <Input
                      {...register(`serials.${index}.source`)}
                      label="Fuente"
                      placeholder="Ej: caja, tarjeta, equipo"
                      error={errors.serials?.[index]?.source?.message}
                    />
                    <label className="flex items-center gap-2 pb-2.5 text-sm text-ink">
                      <input
                        type="checkbox"
                        className="size-4 accent-violet-800"
                        {...register(`serials.${index}.primary`)}
                      />
                      Principal
                    </label>
                    <Button
                      variant="ghost"
                      className="mb-0.5"
                      aria-label={`Eliminar serial ${index + 1}`}
                      onClick={() => remove(index)}
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={isPending} disabled={catalogEmpty} className="min-w-40">
              Guardar inventario
            </Button>
          </div>
        </fieldset>

        {catalogEmpty && (
          <p role="status" className="text-sm text-warning">
            {noModels && noPallets
              ? 'No hay modelos ni pallets registrados. Contacta a un administrador para cargar el catálogo.'
              : noModels
                ? 'No hay modelos de dispositivo registrados. Contacta a un administrador.'
                : 'No hay pallets registrados. Contacta a un administrador.'}
          </p>
        )}
      </form>

      {toastMessage && (
        <Toast tone="success" onDismiss={dismissToast}>
          {toastMessage}
        </Toast>
      )}
    </section>
  );
}

function PageHeader() {
  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">Registrar inventario</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Crea un dispositivo y sus números de serie en una sola operación.
      </p>
    </>
  );
}
