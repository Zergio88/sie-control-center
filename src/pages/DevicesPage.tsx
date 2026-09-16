import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import { useDevices } from '@/hooks/useDevices';
import { mapApiMessage } from '@/lib/apiMessages';
import { formatDateTime } from '@/lib/format';
import type { Device } from '@/types/device';

const COLUMNS: readonly TableColumn<Device>[] = [
  { header: 'Modelo', cell: (device) => device.deviceTypeName ?? '—' },
  { header: 'Pallet', cell: (device) => device.palletCode ?? '—' },
  { header: 'Piso', cell: (device) => device.floorNumber ?? '—' },
  { header: 'Estado', cell: (device) => <StatusBadge status={device.status} /> },
  { header: 'Notas', cell: (device) => device.notes || '—' },
  { header: 'Creado', cell: (device) => formatDateTime(device.createdAt) },
];

export function DevicesPage() {
  const { data, isPending, isError, error, refetch } = useDevices();

  let content: ReactNode;
  if (isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Cargando dispositivos" />
        <p className="text-sm text-ink-muted">
          Cargando dispositivos… puede tardar un momento si el servidor está iniciando.
        </p>
      </div>
    );
  } else if (isError) {
    content = <ErrorState message={mapApiMessage(error)} onRetry={() => void refetch()} />;
  } else if (!data || data.length === 0) {
    content = (
      <EmptyState
        title="No hay dispositivos registrados"
        message="Cuando se registre el primer inventario, los dispositivos aparecerán en esta tabla."
      />
    );
  } else {
    content = (
      <Table
        caption="Dispositivos en el inventario"
        columns={COLUMNS}
        rows={data}
        getRowKey={(device) => device.id}
      />
    );
  }

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Dispositivos</h1>
      <p className="mt-1 text-sm text-ink-muted">Inventario completo de dispositivos.</p>
      <div className="mt-6">{content}</div>
    </section>
  );
}
