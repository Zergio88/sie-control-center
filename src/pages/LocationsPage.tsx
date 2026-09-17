import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useCreateLocation, useDeleteLocation, useLocations } from '@/hooks/useLocations';
import { useZones } from '@/hooks/useZones';
import { mapApiMessage } from '@/lib/apiMessages';
import {
  DEFAULT_LOCATION_VALUES,
  locationFormSchema,
  toCreateLocationRequest,
} from '@/lib/locationForm';
import type { LocationFormValues } from '@/lib/locationForm';
import type { Location } from '@/types/location';

export function LocationsPage() {
  const locations = useLocations();
  const zones = useZones();
  const createLocation = useCreateLocation();
  const deleteLocation = useDeleteLocation();

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'danger'>('success');
  const dismissToast = useCallback(() => setToastMessage(null), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: DEFAULT_LOCATION_VALUES,
  });

  const notify = useCallback((tone: 'success' | 'danger', message: string) => {
    setToastTone(tone);
    setToastMessage(message);
  }, []);

  const handleDelete = useCallback(
    (location: Location) => {
      if (deleteLocation.isPending) return;
      deleteLocation
        .mutateAsync(location.id)
        .then(() => {
          setDeletingId(null);
          notify('success', `Ubicación "${location.name}" eliminada.`);
        })
        .catch((error) => notify('danger', mapApiMessage(error)));
    },
    [deleteLocation, notify],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (createLocation.isPending) return;
    try {
      await createLocation.mutateAsync(toCreateLocationRequest(values));
      notify('success', 'Ubicación creada correctamente.');
      setShowForm(false);
    } catch (error) {
      notify('danger', mapApiMessage(error));
    }
  });

  const columns: readonly TableColumn<Location>[] = [
    { header: 'Zona', cell: (location) => location.zoneName ?? '—' },
    { header: 'Nombre', cell: (location) => location.name },
    { header: 'Tipo', cell: (location) => location.locationType ?? '—' },
    { header: 'Notas', cell: (location) => location.notes || '—' },
    {
      header: 'Acciones',
      cell: (location) =>
        deletingId === location.id ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">¿Eliminar esta ubicación?</span>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={deleteLocation.isPending}
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="px-2 py-1 text-xs"
              loading={deleteLocation.isPending}
              onClick={() => handleDelete(location)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <Button
            variant="danger-outline"
            className="px-2 py-1 text-xs"
            aria-label={`Eliminar ubicación ${location.name}`}
            onClick={() => setDeletingId(location.id)}
          >
            Eliminar
          </Button>
        ),
    },
  ];

  let content: ReactNode;
  if (locations.isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Cargando ubicaciones" />
        <p className="text-sm text-ink-muted">Cargando ubicaciones…</p>
      </div>
    );
  } else if (locations.isError) {
    content = (
      <ErrorState
        message={mapApiMessage(locations.error)}
        onRetry={() => void locations.refetch()}
      />
    );
  } else if (locations.data.length === 0) {
    content = (
      <EmptyState
        title="No hay ubicaciones"
        message="Cuando se cree la primera ubicación aparecerá en esta tabla."
      />
    );
  } else {
    content = (
      <Table
        caption="Ubicaciones del depósito"
        columns={columns}
        rows={locations.data}
        getRowKey={(location) => location.id}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Ubicaciones</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Administra las ubicaciones y su zona. Solo administradores.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="min-w-40">
            + Nueva ubicación
          </Button>
        )}
      </div>

      <CatalogTabs />

      <div className="mt-6">{content}</div>

      <Modal title="Nueva ubicación" open={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={onSubmit} noValidate>
          <fieldset disabled={createLocation.isPending} className="mt-4 space-y-4">
            {zones.isPending ? (
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <Spinner label="Cargando zonas" />
                Cargando zonas…
              </div>
            ) : (
              <Select label="Zona" {...register('zoneId')} error={errors.zoneId?.message}>
                <option value="">— Seleccionar —</option>
                {zones.data?.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </Select>
            )}
            <Input
              label="Nombre"
              placeholder="Ej: Estantería 1"
              autoFocus
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Tipo"
              placeholder="Ej: estantería, área, contenedor"
              {...register('locationType')}
              error={errors.locationType?.message}
            />
            <Input
              label="Notas"
              placeholder="Opcional"
              {...register('notes')}
              error={errors.notes?.message}
            />
          </fieldset>
          {zones.isError && (
            <p className="mt-3 text-sm text-warning">
              No se pudieron cargar las zonas.{' '}
              <button
                type="button"
                className="underline hover:opacity-70"
                onClick={() => void zones.refetch()}
              >
                Reintentar
              </button>
            </p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={createLocation.isPending}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createLocation.isPending} className="min-w-40">
              Guardar ubicación
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
