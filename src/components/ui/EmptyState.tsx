import type { ReactNode } from 'react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  /** Optional call-to-action (e.g. a link to a form). */
  action?: ReactNode;
}

export function EmptyState({ title = 'Sin resultados', message, action }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center"
    >
      <p className="text-base font-semibold text-ink">{title}</p>
      {message && <p className="mt-1 max-w-md text-sm text-ink-muted">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
