import { forwardRef, useId } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Native select styled like {@link Input} — keeps OS dropdown behavior. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, id, className = '', children, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <div>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`input pr-8 ${error ? 'input-error' : ''} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={`${selectId}-hint`} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${selectId}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
});
