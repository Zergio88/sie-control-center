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
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import { Toast } from '@/components/ui/Toast';
import { useCreateZone, useDeleteZone, useZones } from '@/hooks/useZones';
import { mapApiMessage } from '@/lib/apiMessages';
import { DEFAULT_ZONE_VALUES, toCreateZoneRequest, zoneFormSchema } from '@/lib/zoneForm';
import type { ZoneFormValues } from '@/lib/zoneForm';
import type { Zone } from '@/types/zone';

export function ZonesPage() {
  const zones = useZones();
  const createZone = useCreateZone();
  const deleteZone = useDeleteZone();

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'danger'>('success');
  const dismissToast = useCallback(() => setToastMessage(null), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneFormSchema),
    defaultValues: DEFAULT_ZONE_VALUES,
  });

  const notify = useCallback((tone: 'success' | 'danger', message: string) => {
    setToastTone(tone);
    setToastMessage(message);
  }, []);

  const handleDelete = useCallback(
    (zone: Zone) => {
      if (deleteZone.isPending) return;
      deleteZone
        .mutateAsync(zone.id)
        .then(() => {
          setDeletingId(null);
          notify('success', `Zona "${zone.name}" eliminada.`);
        })
        .catch((error) => notify('danger', mapApiMessage(error)));
    },
    [deleteZone, notify],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (createZone.isPending) return;
    try {
      await createZone.mutateAsync(toCreateZoneRequest(values));
      notify('success', 'Zona creada correctamente.');
      setShowForm(false);
    } catch (error) {
      notify('danger', mapApiMessage(error));
    }
  });

  const columns: readonly TableColumn<Zone>[] = [
    { header: 'Nombre', cell: (zone) => zone.name },
    { header: 'Descripción', cell: (zone) => zone.description || '—' },
    {
      header: 'Acciones',
      cell: (zone) =>
        deletingId === zone.id ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">¿Eliminar esta zona?</span>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={deleteZone.isPending}
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="px-2 py-1 text-xs"
              loading={deleteZone.isPending}
              onClick={() => handleDelete(zone)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <Button
            variant="danger-outline"
            className="px-2 py-1 text-xs"
            aria-label={`Eliminar zona ${zone.name}`}
            onClick={() => setDeletingId(zone.id)}
          >
            Eliminar
          </Button>
        ),
    },
  ];

  let content: ReactNode;
  if (zones.isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Cargando zonas" />
        <p className="text-sm text-ink-muted">Cargando zonas…</p>
      </div>
    );
  } else if (zones.isError) {
    content = (
      <ErrorState message={mapApiMessage(zones.error)} onRetry={() => void zones.refetch()} />
    );
  } else if (zones.data.length === 0) {
    content = (
      <EmptyState
        title="No hay zonas"
        message="Cuando se cree la primera zona aparecerá en esta tabla."
      />
    );
  } else {
    content = (
      <Table
        caption="Zonas del depósito"
        columns={columns}
        rows={zones.data}
        getRowKey={(zone) => zone.id}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Zonas</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Administra las zonas del depósito. Solo administradores.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="min-w-32">
            + Nueva zona
          </Button>
        )}
      </div>

      <CatalogTabs />

      <div className="mt-6">{content}</div>

      <Modal title="Nueva zona" open={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={onSubmit} noValidate>
          <fieldset disabled={createZone.isPending} className="mt-4 space-y-4">
            <Input
              label="Nombre"
              placeholder="Ej: Zona A"
              autoFocus
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Descripción"
              placeholder="Opcional"
              {...register('description')}
              error={errors.description?.message}
            />
          </fieldset>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={createZone.isPending}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createZone.isPending} className="min-w-32">
              Guardar zona
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
