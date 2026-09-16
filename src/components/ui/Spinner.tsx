export interface SpinnerProps {
  className?: string;
  /** Screen-reader text describing what is loading. */
  label?: string;
}

export function Spinner({ className = '', label = 'Cargando' }: SpinnerProps) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label={label}
    />
  );
}
