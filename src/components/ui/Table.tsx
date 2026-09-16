import type { ReactNode } from 'react';

export interface TableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
}

interface TableProps<T> {
  /** Visually hidden description of the table for screen readers. */
  caption?: string;
  columns: readonly TableColumn<T>[];
  rows: readonly T[];
  getRowKey: (row: T) => string | number;
}

/**
 * Minimal hand-built table — no pagination/sorting in the MVP. The page is
 * responsible for empty/loading/error states; this renders only when there
 * are rows. Wraps the semantic `<table>` in a horizontally scrollable panel
 * so it degrades gracefully on small screens.
 */
export function Table<T>({ caption, columns, rows, getRowKey }: TableProps<T>) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold tracking-wide text-ink-muted ${
                  column.align === 'right' ? 'text-right' : 'text-left'
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className="border-b border-border last:border-b-0 hover:bg-surface-muted/60"
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={`px-4 py-3 align-top text-ink ${
                    column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
