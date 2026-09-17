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
import { useLocations } from '@/hooks/useLocations';
import { useCreatePallet, useDeletePallet, usePallets } from '@/hooks/usePallets';
import { mapApiMessage } from '@/lib/apiMessages';
import { formatDateTime } from '@/lib/format';
import { DEFAULT_PALLET_VALUES, palletFormSchema, toCreatePalletRequest } from '@/lib/palletForm';
import type { PalletFormValues } from '@/lib/palletForm';
import type { Pallet } from '@/types/pallet';

export function PalletsPage() {
  const pallets = usePallets();
  const locations = useLocations();
  const createPallet = useCreatePallet();
  const deletePallet = useDeletePallet();

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'danger'>('success');
  const dismissToast = useCallback(() => setToastMessage(null), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PalletFormValues>({
    resolver: zodResolver(palletFormSchema),
    defaultValues: DEFAULT_PALLET_VALUES,
  });

  const notify = useCallback((tone: 'success' | 'danger', message: string) => {
    setToastTone(tone);
    setToastMessage(message);
  }, []);

  const handleDelete = useCallback(
    (pallet: Pallet) => {
      if (deletePallet.isPending) return;
      deletePallet
        .mutateAsync(pallet.id)
        .then(() => {
          setDeletingId(null);
          notify('success', `Pallet "${pallet.code}" eliminado.`);
        })
        .catch((error) => notify('danger', mapApiMessage(error)));
    },
    [deletePallet, notify],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (createPallet.isPending) return;
    try {
      await createPallet.mutateAsync(toCreatePalletRequest(values));
      notify('success', 'Pallet creado correctamente.');
      setShowForm(false);
    } catch (error) {
      notify('danger', mapApiMessage(error));
    }
  });

  const columns: readonly TableColumn<Pallet>[] = [
    { header: 'Ubicación', cell: (pallet) => pallet.locationName ?? '—' },
    { header: 'Código', cell: (pallet) => pallet.code },
    {
      header: 'Máx. pisos',
      align: 'right',
      cell: (pallet) => pallet.maxFloors ?? '—',
    },
    { header: 'Notas', cell: (pallet) => pallet.notes || '—' },
    { header: 'Creado', cell: (pallet) => formatDateTime(pallet.createdAt) },
    { header: 'Actualizado', cell: (pallet) => formatDateTime(pallet.updatedAt) },
    {
      header: 'Acciones',
      cell: (pallet) =>
        deletingId === pallet.id ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">¿Eliminar este pallet?</span>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={deletePallet.isPending}
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="px-2 py-1 text-xs"
              loading={deletePallet.isPending}
              onClick={() => handleDelete(pallet)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <Button
            variant="danger-outline"
            className="px-2 py-1 text-xs"
            aria-label={`Eliminar pallet ${pallet.code}`}
            onClick={() => setDeletingId(pallet.id)}
          >
            Eliminar
          </Button>
        ),
    },
  ];

  let content: ReactNode;
  if (pallets.isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Cargando pallets" />
        <p className="text-sm text-ink-muted">Cargando pallets…</p>
      </div>
    );
  } else if (pallets.isError) {
    content = (
      <ErrorState message={mapApiMessage(pallets.error)} onRetry={() => void pallets.refetch()} />
    );
  } else if (pallets.data.length === 0) {
    content = (
      <EmptyState
        title="No hay pallets"
        message="Cuando se cree el primer pallet aparecerá en esta tabla."
      />
    );
  } else {
    content = (
      <Table
        caption="Pallets del depósito"
        columns={columns}
        rows={pallets.data}
        getRowKey={(pallet) => pallet.id}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Pallets</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Administra los pallets y su ubicación. Solo administradores.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="min-w-32">
            + Nuevo pallet
          </Button>
        )}
      </div>

      <CatalogTabs />

      <div className="mt-6">{content}</div>

      <Modal title="Nuevo pallet" open={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={onSubmit} noValidate>
          <fieldset disabled={createPallet.isPending} className="mt-4 space-y-4">
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
            <Input
              label="Código"
              placeholder="Ej: P-001"
              autoFocus
              {...register('code')}
              error={errors.code?.message}
            />
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              label="Máximo de pisos"
              placeholder="1"
              {...register('maxFloors')}
              error={errors.maxFloors?.message}
            />
            <Input
              label="Notas"
              placeholder="Opcional"
              {...register('notes')}
              error={errors.notes?.message}
            />
          </fieldset>
          {locations.isError && (
            <p className="mt-3 text-sm text-warning">
              No se pudieron cargar las ubicaciones.{' '}
              <button
                type="button"
                className="underline hover:opacity-70"
                onClick={() => void locations.refetch()}
              >
                Reintentar
              </button>
            </p>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={createPallet.isPending}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createPallet.isPending} className="min-w-32">
              Guardar pallet
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
