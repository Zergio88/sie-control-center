import { useEffect } from 'react';
import type { ReactNode } from 'react';

export type ToastTone = 'success' | 'danger' | 'info';

export interface ToastProps {
  tone?: ToastTone;
  /** Milliseconds before the toast auto-dismisses. Default 5000. */
  autoDismiss?: number;
  onDismiss: () => void;
  children: ReactNode;
}

const TONE_CLASS: Record<ToastTone, string> = {
  success: 'border-success/30 bg-success-bg text-success',
  danger: 'border-danger/30 bg-danger-bg text-danger',
  info: 'border-violet-600/30 bg-violet-100 text-violet-900',
};

/**
 * Single-slot toast for inline feedback (e.g. "inventario guardado").
 * Auto-dismisses and announces to assistive tech via an aria-live region.
 */
export function Toast({ tone = 'success', autoDismiss = 5000, onDismiss, children }: ToastProps) {
  useEffect(() => {
    if (autoDismiss <= 0) return;
    const timer = window.setTimeout(onDismiss, autoDismiss);
    return () => window.clearTimeout(timer);
  }, [autoDismiss, onDismiss]);

  return (
    <div
      role="status"
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-md border px-4 py-3 text-sm font-medium shadow-lg ${TONE_CLASS[tone]}`}
    >
      <p className="flex-1">{children}</p>
      <button
        type="button"
        aria-label="Cerrar notificación"
        onClick={onDismiss}
        className="cursor-pointer rounded p-0.5 leading-none hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        ✕
      </button>
    </div>
  );
}
