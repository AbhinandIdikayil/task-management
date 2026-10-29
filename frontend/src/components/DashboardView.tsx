import { Link } from 'react-router-dom';

import DashboardStats from './DashboardStats';
import { TASK_STATUS_LABELS } from '../types';
import type { DashboardStats as DashboardStatsData, Task, TaskStatus } from '../types';

const STATUS_DOT: Record<TaskStatus, string> = {
  pending: 'bg-status-pending-spine',
  in_progress: 'bg-status-progress-spine',
  completed: 'bg-status-done-spine',
};

interface Props {
  stats: DashboardStatsData | null;
  statsLoading: boolean;
  statsError: string | null;
  latest: Task[];
  latestLoading: boolean;
  latestError: string | null;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function DashboardView({
  stats,
  statsLoading,
  statsError,
  latest,
  latestLoading,
  latestError,
}: Props) {
  return (
    <div>
      <DashboardStats stats={stats} loading={statsLoading} error={statsError} />

      <section className="mt-7">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="m-0 font-display text-lg font-bold tracking-tight">Latest tasks</h2>
          <Link
            to="/tasks"
            className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-ink no-underline hover:underline hover:underline-offset-4"
          >
            View all tasks
          </Link>
        </div>

        <ul className="m-0 mt-3 list-none overflow-hidden rounded-xl border border-ink/10 bg-white p-0">
          {latestLoading &&
            [0, 1, 2].map((index) => (
              <li
                key={index}
                className="animate-pulse border-t border-ink/10 px-4 py-3.5 first:border-t-0"
              >
                <div aria-hidden className="h-4 w-1/2 rounded bg-ink/10" />
              </li>
            ))}

          {!latestLoading && latestError && (
            <li className="px-4 py-3.5 text-sm text-rose-700">{latestError}</li>
          )}

          {!latestLoading && !latestError && latest.length === 0 && (
            <li className="px-4 py-3.5 text-sm text-ink/70">
              No tasks yet — add one from the Tasks page.
            </li>
          )}

          {!latestLoading &&
            !latestError &&
            latest.map((task) => (
              <li key={task._id} className="flex items-center gap-3 border-t border-ink/10 px-4 py-3.5 first:border-t-0">
                <span
                  aria-hidden
                  className={`size-2 shrink-0 rounded-full ${STATUS_DOT[task.status]}`}
                />
                <span className={`min-w-0 flex-1 truncate text-sm font-medium ${
                  task.status === 'completed' ? 'text-ink/50' : 'text-ink'
                }`}>
                  {task.title}
                </span>
                <span className={`badge badge-${task.status} hidden sm:inline-flex`}>
                  {TASK_STATUS_LABELS[task.status]}
                </span>
                <time dateTime={task.createdAt} className="text-xs text-ink/70 tabular-nums">
                  {formatDate(task.createdAt)}
                </time>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
