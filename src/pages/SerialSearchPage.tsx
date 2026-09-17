import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import type { ToastTone } from '@/components/ui/Toast';
import { useSerialSearch } from '@/hooks/useSerialSearch';
import { mapApiMessage } from '@/lib/apiMessages';
import { formatDateTime } from '@/lib/format';
import type { ApiError } from '@/types/auth';

/** Extracts the HTTP status from a normalized {@link ApiError} (undefined otherwise). */
function errorStatus(error: unknown): number | undefined {
  return typeof error === 'object' && error !== null
    ? (error as Partial<ApiError>).status
    : undefined;
}

export function SerialSearchPage() {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<ToastTone>('success');
  const inputRef = useRef<HTMLInputElement>(null);

  const { serialQuery, deviceQuery } = useSerialSearch(submitted);

  const dismissToast = useCallback(() => setToastMessage(null), []);
  const notify = useCallback((tone: ToastTone, message: string) => {
    setToastTone(tone);
    setToastMessage(message);
  }, []);

  // A 404 from the backend is the expected "no existe" answer, not an error.
  const notFound = serialQuery.isError && errorStatus(serialQuery.error) === 404;

  // Fire a toast when a search settles (success / not found / real error).
  useEffect(() => {
    if (serialQuery.status !== 'success' && serialQuery.status !== 'error') return;
    if (serialQuery.status === 'success') {
      notify('success', 'Número de serie encontrado.');
    } else if (notFound) {
      notify('info', `El serial "${submitted}" no existe.`);
    } else {
      notify('danger', mapApiMessage(serialQuery.error));
    }
  }, [serialQuery.status, serialQuery.error, notFound, submitted, notify]);

  // Scanner workflow: after a settled search, clear the old value so the next
  // scan (Enter-to-submit) replaces it — no need to delete the previous one.
  useEffect(() => {
    if (serialQuery.status === 'success' || serialQuery.status === 'error') {
      inputRef.current?.select();
    }
  }, [serialQuery.status]);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setInputError('Escribí o escaneá un número de serie.');
      return;
    }
    setInputError(null);
    setSubmitted(trimmed);
  };

  let content: ReactNode;
  if (submitted === '') {
    content = (
      <EmptyState
        title="Buscá un número de serie"
        message="Ingresá el número en el campo superior y presioná Enter. El escáner de código de barras funciona igual: el campo se mantiene enfocado para buscar varios en fila."
      />
    );
  } else if (serialQuery.isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Buscando serie" />
        <p className="text-sm text-ink-muted">Buscando serie…</p>
      </div>
    );
  } else if (notFound) {
    content = (
      <EmptyState
        title="Número no encontrado"
        message={`No se encontró ningún dispositivo con el serial "${submitted}". Verificá que el número sea correcto e intentá de nuevo.`}
      />
    );
  } else if (serialQuery.isError) {
    content = (
      <ErrorState
        message={mapApiMessage(serialQuery.error)}
        onRetry={() => void serialQuery.refetch()}
      />
    );
  } else if (serialQuery.data) {
    const device = deviceQuery.data;
    let deviceContent: ReactNode;
    if (deviceQuery.isPending) {
      deviceContent = (
        <div className="flex items-center gap-3 py-3">
          <Spinner label="Cargando dispositivo" />
          <p className="text-sm text-ink-muted">Cargando dispositivo…</p>
        </div>
      );
    } else if (deviceQuery.isError) {
      deviceContent =
        errorStatus(deviceQuery.error) === 404 ? (
          <p className="py-3 text-sm text-ink-muted">
            El dispositivo asociado a este serial fue eliminado.
          </p>
        ) : (
          <div className="py-3">
            <ErrorState
              message={mapApiMessage(deviceQuery.error)}
              onRetry={() => void deviceQuery.refetch()}
            />
          </div>
        );
    } else if (device) {
      deviceContent = (
        <dl className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          <div className="py-1">
            <dt className="text-ink-muted">Modelo</dt>
            <dd className="font-medium text-ink">{device.deviceTypeName ?? '—'}</dd>
          </div>
          <div className="py-1">
            <dt className="text-ink-muted">Pallet</dt>
            <dd className="font-medium text-ink">{device.palletCode ?? '—'}</dd>
          </div>
          <div className="py-1">
            <dt className="text-ink-muted">Piso</dt>
            <dd className="font-medium text-ink">{device.floorNumber ?? '—'}</dd>
          </div>
          <div className="py-1">
            <dt className="text-ink-muted">Estado</dt>
            <dd className="font-medium text-ink">
              <StatusBadge status={device.status} />
            </dd>
          </div>
          <div className="py-1">
            <dt className="text-ink-muted">Notas</dt>
            <dd className="font-medium text-ink">{device.notes || '—'}</dd>
          </div>
          <div className="py-1">
            <dt className="text-ink-muted">Registrado</dt>
            <dd className="font-medium text-ink">{formatDateTime(device.createdAt)}</dd>
          </div>
        </dl>
      );
    }

    content = (
      <div role="status" aria-live="polite" className="mt-6 space-y-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-ink-muted">Número de serie</h2>
            {serialQuery.data.primary && <Badge tone="info">Principal</Badge>}
          </div>
          <p className="mt-1 break-words text-xl font-semibold text-ink">
            {serialQuery.data.value}
          </p>
          <p className="mt-1 text-sm text-ink-muted">Fuente: {serialQuery.data.source || '—'}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold tracking-wide text-ink-muted">Dispositivo</h2>
          <div className="mt-1">{deviceContent}</div>
        </div>
      </div>
    );
  }

  const handleInputChange = (next: string): void => {
    setValue(next);
    if (inputError) setInputError(null);
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">Buscar serial</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Verificá a qué dispositivo corresponde un número de serie.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <form onSubmit={onSubmit} noValidate>
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder="Ej: SN-0001"
            label="Número de serie"
            error={inputError ?? undefined}
            hint="Escribí el número y presioná Enter (funciona igual con el escáner). Se mantiene el foco para buscar varios en fila."
            autoComplete="off"
            spellCheck={false}
            maxLength={100}
          />
          <Button type="submit" className="mt-4 min-w-32">
            Buscar
          </Button>
        </form>
      </div>

      {content}

      {toastMessage && (
        <Toast tone={toastTone} onDismiss={dismissToast}>
          {toastMessage}
        </Toast>
      )}
    </section>
  );
}
