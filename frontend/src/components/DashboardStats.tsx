import type { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const SEGMENTS = [
  { key: 'pending', label: 'Pending', bar: 'bg-status-pending-spine' },
  { key: 'inProgress', label: 'In progress', bar: 'bg-status-progress-spine' },
  { key: 'completed', label: 'Completed', bar: 'bg-status-done-spine' },
] as const;

export default function DashboardStats({ stats, loading, error }: Props) {
  if (!stats && error) {
    return (
      <div className="banner-error" role="alert">
        <span>Could not load your task overview: {error}</span>
      </div>
    );
  }

  const total = stats?.total ?? 0;
  const segments = SEGMENTS.map((segment) => {
    const count = stats?.[segment.key] ?? 0;
    return {
      ...segment,
      count,
      pct: total === 0 ? 0 : (count / total) * 100,
    };
  });
  const summary = `${total} task${total === 1 ? '' : 's'}: ${segments
    .map((segment) => `${segment.count} ${segment.label.toLowerCase()}`)
    .join(', ')}`;

  return (
    <section
      aria-busy={loading}
      aria-label="Task overview"
      className={`mb-6 rounded-xl border border-ink/10 bg-white p-5 ${loading ? 'animate-pulse' : ''}`}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-semibold text-ink">
            {loading ? 'Counting tasks…' : summary}
          </p>

          {total === 0 ? (
            <div className="mt-3 h-3.5 rounded-full border border-dashed border-ink/25" />
          ) : (
            <div className="mt-3 flex h-3.5 gap-1 overflow-hidden rounded-full bg-ink/10" role="img" aria-label={summary}>
              {segments
                .filter((segment) => segment.count > 0)
                .map((segment) => (
                  <div
                    key={segment.key}
                    className={`h-full min-w-[3px] ${segment.bar}`}
                    style={{ width: `${segment.pct}%` }}
                  />
                ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-ink/70">
            {segments.map((segment) => (
              <span key={segment.key} className="flex items-center gap-2">
                <span aria-hidden className={`size-2 rounded-full ${segment.bar}`} />
                {segment.label}
                <strong className="font-semibold text-ink tabular-nums">
                  {loading ? '—' : segment.count}
                </strong>
              </span>
            ))}
          </div>
        </div>

        <div className="shrink-0 md:text-right">
          <div className="font-display text-4xl font-extrabold leading-none tracking-tight tabular-nums">
            {loading ? '—' : stats?.completionRate ?? 0}
            <span className="text-xl font-bold">%</span>
          </div>
          <div className="mt-1.5 text-sm text-ink/60">completion rate</div>
        </div>
      </div>
    </section>
  );
}
