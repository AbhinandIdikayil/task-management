import type { PaginationMeta } from '../types';

interface Props {
  meta: PaginationMeta | null;
  onPageChange(page: number): void;
}

export default function Pagination({ meta, onPageChange }: Props) {
  if (!meta || meta.totalPages <= 1) {
    return null;
  }

  const rangeStart = (meta.page - 1) * meta.limit + 1;
  const rangeEnd = Math.min(meta.page * meta.limit, meta.total);

  return (
    <nav aria-label="Task list pages" className="mt-5 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        className="btn btn-ghost"
        disabled={!meta.hasPrevPage}
        onClick={() => onPageChange(meta.page - 1)}
      >
        ← Previous
      </button>

      <span className="text-sm text-ink/70 tabular-nums">
        Showing {rangeStart}–{rangeEnd} of {meta.total} task{meta.total === 1 ? '' : 's'}
      </span>

      <button
        type="button"
        className="btn btn-ghost"
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(meta.page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}
