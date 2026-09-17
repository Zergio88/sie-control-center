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
import { useCreateDeviceType, useDeleteDeviceType, useDeviceTypes } from '@/hooks/useDeviceTypes';
import { mapApiMessage } from '@/lib/apiMessages';
import {
  DEFAULT_DEVICE_TYPE_VALUES,
  deviceTypeFormSchema,
  toCreateDeviceTypeRequest,
} from '@/lib/deviceTypeForm';
import type { DeviceTypeFormValues } from '@/lib/deviceTypeForm';
import { formatDateTime } from '@/lib/format';
import type { DeviceType } from '@/types/deviceType';

export function DeviceTypesPage() {
  const deviceTypes = useDeviceTypes();
  const createDeviceType = useCreateDeviceType();
  const deleteDeviceType = useDeleteDeviceType();

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'danger'>('success');
  const dismissToast = useCallback(() => setToastMessage(null), []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceTypeFormValues>({
    resolver: zodResolver(deviceTypeFormSchema),
    defaultValues: DEFAULT_DEVICE_TYPE_VALUES,
  });

  const notify = useCallback((tone: 'success' | 'danger', message: string) => {
    setToastTone(tone);
    setToastMessage(message);
  }, []);

  const handleDelete = useCallback(
    (deviceType: DeviceType) => {
      if (deleteDeviceType.isPending) return;
      deleteDeviceType
        .mutateAsync(deviceType.id)
        .then(() => {
          setDeletingId(null);
          notify('success', `Tipo "${deviceType.name}" eliminado.`);
        })
        .catch((error) => notify('danger', mapApiMessage(error)));
    },
    [deleteDeviceType, notify],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (createDeviceType.isPending) return;
    try {
      await createDeviceType.mutateAsync(toCreateDeviceTypeRequest(values));
      notify('success', 'Tipo de dispositivo creado correctamente.');
      setShowForm(false);
    } catch (error) {
      notify('danger', mapApiMessage(error));
    }
  });

  const columns: readonly TableColumn<DeviceType>[] = [
    { header: 'Nombre', cell: (deviceType) => deviceType.name },
    { header: 'Marca', cell: (deviceType) => deviceType.brand ?? '—' },
    { header: 'Modelo', cell: (deviceType) => deviceType.model ?? '—' },
    { header: 'Categoría', cell: (deviceType) => deviceType.category ?? '—' },
    { header: 'Descripción', cell: (deviceType) => deviceType.description || '—' },
    { header: 'Creado', cell: (deviceType) => formatDateTime(deviceType.createdAt) },
    { header: 'Actualizado', cell: (deviceType) => formatDateTime(deviceType.updatedAt) },
    {
      header: 'Acciones',
      cell: (deviceType) =>
        deletingId === deviceType.id ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-ink-muted">
              ¿Eliminar este tipo de dispositivo?
            </span>
            <Button
              variant="secondary"
              className="px-2 py-1 text-xs"
              disabled={deleteDeviceType.isPending}
              onClick={() => setDeletingId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="px-2 py-1 text-xs"
              loading={deleteDeviceType.isPending}
              onClick={() => handleDelete(deviceType)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <Button
            variant="danger-outline"
            className="px-2 py-1 text-xs"
            aria-label={`Eliminar tipo de dispositivo ${deviceType.name}`}
            onClick={() => setDeletingId(deviceType.id)}
          >
            Eliminar
          </Button>
        ),
    },
  ];

  let content: ReactNode;
  if (deviceTypes.isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Cargando tipos de dispositivo" />
        <p className="text-sm text-ink-muted">Cargando tipos de dispositivo…</p>
      </div>
    );
  } else if (deviceTypes.isError) {
    content = (
      <ErrorState
        message={mapApiMessage(deviceTypes.error)}
        onRetry={() => void deviceTypes.refetch()}
      />
    );
  } else if (deviceTypes.data.length === 0) {
    content = (
      <EmptyState
        title="No hay tipos de dispositivo"
        message="Cuando se cree el primer tipo de dispositivo aparecerá en esta tabla."
      />
    );
  } else {
    content = (
      <Table
        caption="Tipos de dispositivo del catálogo"
        columns={columns}
        rows={deviceTypes.data}
        getRowKey={(deviceType) => deviceType.id}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Tipos de dispositivo</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Administra los modelos del catálogo. Solo administradores.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="min-w-40">
            + Nuevo tipo de dispositivo
          </Button>
        )}
      </div>

      <CatalogTabs />

      <div className="mt-6">{content}</div>

      <Modal title="Nuevo tipo de dispositivo" open={showForm} onClose={() => setShowForm(false)}>
        <form onSubmit={onSubmit} noValidate>
          <fieldset disabled={createDeviceType.isPending} className="mt-4 space-y-4">
            <Input
              label="Nombre"
              placeholder="Ej: Sensor de temperatura"
              autoFocus
              {...register('name')}
              error={errors.name?.message}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Marca"
                placeholder="Opcional"
                {...register('brand')}
                error={errors.brand?.message}
              />
              <Input
                label="Modelo"
                placeholder="Opcional"
                {...register('model')}
                error={errors.model?.message}
              />
              <Input
                label="Categoría"
                placeholder="Ej: sensor, actuador"
                {...register('category')}
                error={errors.category?.message}
              />
            </div>
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
              disabled={createDeviceType.isPending}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createDeviceType.isPending} className="min-w-40">
              Guardar tipo
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
