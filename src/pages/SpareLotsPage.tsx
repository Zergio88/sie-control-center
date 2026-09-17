import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CatalogTabs } from '@/components/catalog/CatalogTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import { Toast } from '@/components/ui/Toast';
import { useDeviceTypes } from '@/hooks/useDeviceTypes';
import { useLocations } from '@/hooks/useLocations';
import { useCreateSpareLot, useDeleteSpareLot, useSpareLots } from '@/hooks/useSpareLots';
import { mapApiMessage } from '@/lib/apiMessages';
import { formatDateTime } from '@/lib/format';
import {
  DEFAULT_SPARE_LOT_VALUES,
  spareLotFormSchema,
  toCreateSpareLotRequest,
} from '@/lib/spareLotForm';
import type { SpareLotFormValues } from '@/lib/spareLotForm';
import type { SpareLot } from '@/types/spareLot';

export function SpareLotsPage() {
  const spareLots = useSpareLots();
  const deviceTypes = useDeviceTypes();
  const locations = useLocations();
  const createSpareLot = useCreateSpareLot();
  const deleteSpareLot = useDeleteSpareLot();

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'danger'>('success');
  const dismissToast = useCallback(() => setToastMessage(null), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SpareLotFormValues>({
    resolver: zodResolver(spareLotFormSchema),
    defaultValues: DEFAULT_SPARE_LOT_VALUES,
  });

  const notify = useCallback((tone: 'success' | 'danger', message: string) => {
    setToastTone(tone);
    setToastMessage(message);
  }, []);

  const handleDelete = useCallback(
    (lot: SpareLot) => {
      if (deleteSpareLot.isPending) return;
      deleteSpareLot
        .mutateAsync(lot.id)
        .then(() => {
          setDeletingId(null);
          notify('success', 'Lote de repuestos eliminado.');
        })
        .catch((error) => notify('danger', mapApiMessage(error)));
    },
    [deleteSpareLot, notify],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (createSpareLot.isPending) return;
    try {
      await createSpareLot.mutateAsync(toCreateSpareLotRequest(values));
      notify('success', 'Lote de repuestos creado correctamente.');
      setShowForm(false);
    } catch (error) {
      notify('danger', mapApiMessage(error));
    }
  });

  const columns: readonly TableColumn<SpareLot>[] = [
    { header: 'Tipo de dispositivo', cell: (lot) => lot.deviceName ?? '—' },
    { header: 'Ubicación', cell: (lot) => lot.locationName ?? '—' },
    { header: 'Cantidad', align: 'right', cell: (lot) => lot.quantity },
    { header: 'Unidad', cell: (lot) => lot.unit },
    { header: 'Estado', cell: (lot) => <StatusBadge status={lot.status} /> },
    { header: 'Notas', cell: (lot) => lot.notes || '—' },
    { header: 'Creado', cell: (lot) => formatDateTime(lot.createdAt) },
    {
      header: 'Acciones',
      cell: (lot) =>
        deletingId === lot.id ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">¿Eliminar este lote?</span>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={deleteSpareLot.isPending}
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="px-2 py-1 text-xs"
              loading={deleteSpareLot.isPending}
              onClick={() => handleDelete(lot)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <Button
            variant="danger-outline"
            className="px-2 py-1 text-xs"
            aria-label={`Eliminar lote de repuestos de ${lot.deviceName ?? lot.id}`}
            onClick={() => setDeletingId(lot.id)}
          >
            Eliminar
          </Button>
        ),
    },
  ];

  let content: ReactNode;
  if (spareLots.isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Cargando lotes de repuestos" />
        <p className="text-sm text-ink-muted">Cargando lotes de repuestos…</p>
      </div>
    );
  } else if (spareLots.isError) {
    content = (
      <ErrorState
        message={mapApiMessage(spareLots.error)}
        onRetry={() => void spareLots.refetch()}
      />
    );
  } else if (spareLots.data.length === 0) {
    content = (
      <EmptyState
        title="No hay lotes de repuestos"
        message="Cuando se cree el primer lote de repuestos aparecerá en esta tabla."
      />
    );
  } else {
    content = (
      <Table
        caption="Lotes de repuestos del catálogo"
        columns={columns}
        rows={spareLots.data}
        getRowKey={(lot) => lot.id}
      />
    );
  }

  const noDeviceTypes = (deviceTypes.data?.length ?? 0) === 0;
  const noLocations = (locations.data?.length ?? 0) === 0;

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Lotes de repuestos</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Administra los lotes de repuestos del catálogo. Solo administradores.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="min-w-40">
            + Nuevo lote de repuestos
          </Button>
        )}
      </div>

      <CatalogTabs />

      <div className="mt-6">{content}</div>

      <Modal title="Nuevo lote de repuestos" open={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={onSubmit} noValidate>
          <fieldset disabled={createSpareLot.isPending} className="mt-4 space-y-4">
            {deviceTypes.isPending ? (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner label="Cargando tipos de dispositivo" />
                Cargando tipos de dispositivo…
              </div>
            ) : (
              <Select
                label="Tipo de dispositivo"
                autoFocus
                {...register('deviceTypeId')}
                error={errors.deviceTypeId?.message}
              >
                <option value="">— Seleccionar —</option>
                {deviceTypes.data?.map((deviceType) => (
                  <option key={deviceType.id} value={deviceType.id}>
                    {deviceType.name}
                  </option>
                ))}
              </Select>
            )}
            {locations.isPending ? (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner label="Cargando ubicaciones" />
                Cargando ubicaciones…
              </div>
            ) : (
              <Select
                label="Ubicación"
                {...register('locationId')}
                error={errors.locationId?.message}
              >
                <option value="">— Seleccionar —</option>
                {locations.data?.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </Select>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                label="Cantidad"
                placeholder="1"
                {...register('quantity')}
                error={errors.quantity?.message}
              />
              <Input
                label="Unidad"
                placeholder="Ej: unidad, caja"
                {...register('unit')}
                error={errors.unit?.message}
              />
              <Input
                label="Estado"
                placeholder="Ej: available"
                {...register('status')}
                error={errors.status?.message}
              />
            </div>
            <Input
              label="Notas"
              placeholder="Opcional"
              {...register('notes')}
              error={errors.notes?.message}
            />
          </fieldset>
          {(deviceTypes.isError || locations.isError) && (
            <p className="mt-3 text-sm text-warning">
              No se pudieron cargar todos los catálogos.{' '}
              <button
                type="button"
                className="underline hover:opacity-70"
                onClick={() => {
                  void deviceTypes.refetch();
                  void locations.refetch();
                }}
              >
                Reintentar
              </button>
            </p>
          )}
          {(noDeviceTypes || noLocations) && (
            <p role="status" className="mt-3 text-sm text-warning">
              {noDeviceTypes && noLocations
                ? 'Aún no hay tipos de dispositivo ni ubicaciones. Créalos primero.'
                : noDeviceTypes
                  ? 'Aún no hay tipos de dispositivo. Créalo primero.'
                  : 'Aún no hay ubicaciones. Créala primero.'}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={createSpareLot.isPending}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createSpareLot.isPending} className="min-w-40">
              Guardar lote
            </Button>
          </div>
        </form>
      </Modal>

      {toastMessage && (
        <Toast tone={toastTone} onDismiss={dismissToast}>
          {toastMessage}
        </Toast>
      )}
    </section>
  );
}
