import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  /** Re-runs the failed fetch. Hidden when omitted. */
  onRetry?: () => void;
}

export function ErrorState({ title = 'Ocurrió un error', message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-danger/20 bg-danger-bg/50 px-6 py-16 text-center"
    >
      <p className="text-base font-semibold text-danger">{title}</p>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
