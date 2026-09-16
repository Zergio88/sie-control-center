import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}

const TONE_CLASS: Record<BadgeTone, string> = {
  neutral: 'bg-surface-muted text-ink-muted ring-border',
  success: 'bg-success-bg text-success ring-success/30',
  warning: 'bg-warning-bg text-warning ring-warning/30',
  danger: 'bg-danger-bg text-danger ring-danger/30',
  info: 'bg-violet-100 text-violet-800 ring-violet-600/30',
};

export function Badge({ tone = 'neutral', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, BadgeTone> = {
  available: 'success',
  'in-use': 'info',
  maintenance: 'warning',
};

/**
 * Colored badge for a device status. Status is free text on the backend, so
 * only well-known values are colored; anything else renders as neutral
 * (showing the raw value rather than inventing a translation).
 */
export function StatusBadge({ status }: { status: string }) {
  const tone = status ? (STATUS_TONE[status.toLowerCase()] ?? 'neutral') : 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}
