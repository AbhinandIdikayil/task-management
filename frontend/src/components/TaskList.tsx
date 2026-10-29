import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../types';
import type { Task, TaskPriority, TaskStatus } from '../types';

interface Props {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  onEdit(task: Task): void;
  onDelete(task: Task): void;
  onReload(): void;
  onClearFilters(): void;
  onCreate(): void;
}

const STATUS_SPINE: Record<TaskStatus, string> = {
  pending: 'bg-status-pending-spine',
  in_progress: 'bg-status-progress-spine',
  completed: 'bg-status-done-spine',
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
};

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TaskList({
  tasks,
  loading,
  error,
  hasFilters,
  onEdit,
  onDelete,
  onReload,
  onClearFilters,
  onCreate,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4" aria-busy="true">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} aria-hidden className="animate-pulse space-y-2.5 rounded-xl border border-ink/10 bg-white p-4">
            <div className="h-4 w-2/3 rounded bg-ink/10" />
            <div className="h-3.5 w-full rounded bg-ink/10" />
            <div className="h-3.5 w-2/5 rounded bg-ink/10" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="banner-error" role="alert">
        <span>{error}</span>
        <button type="button" className="btn btn-ghost" onClick={onReload}>
          Retry
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink/25 bg-white/60 px-6 py-12 text-center">
        <h3 className="m-0 font-display text-lg font-bold">No tasks found</h3>
        {hasFilters ? (
          <>
            <p className="mt-1.5 mb-4 text-sm text-ink/60">
              Nothing matches your current search or filters.
            </p>
            <button type="button" className="btn btn-ghost" onClick={onClearFilters}>
              Clear filters
            </button>
          </>
        ) : (
          <>
            <p className="mt-1.5 mb-4 text-sm text-ink/60">Your task list is empty.</p>
            <button type="button" className="btn btn-primary" onClick={onCreate}>
              Add task
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4 p-0">
      {tasks.map((task) => (
        <li
          key={task._id}
          className="relative flex flex-col overflow-hidden rounded-xl border border-ink/10 bg-white p-4 pl-5"
        >
          <span
            aria-hidden
            className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_SPINE[task.status]}`}
          />

          <div className="flex items-start justify-between gap-3">
            <h3
              className={`m-0 min-w-0 flex-1 text-[15px] font-semibold leading-snug break-words ${
                task.status === 'completed' ? 'text-ink/50 line-through' : ''
              }`}
            >
              {task.title}
            </h3>
            <span className={`badge badge-${task.status}`}>{TASK_STATUS_LABELS[task.status]}</span>
          </div>

          <p className="m-0 mt-2 flex-1 text-sm leading-relaxed text-ink/70 break-words">
            {task.description || 'No description provided.'}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink/70">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className={`size-2 rounded-full ${PRIORITY_DOT[task.priority]}`} />
              {TASK_PRIORITY_LABELS[task.priority]} priority
            </span>
            <time dateTime={task.createdAt} className="tabular-nums">
              {formatDate(task.createdAt)}
            </time>
          </div>

          <div className="mt-3 flex gap-2 border-t border-ink/10 pt-3">
            <button
              type="button"
              className="btn btn-ghost px-3 py-1.5 text-[13px]"
              onClick={() => onEdit(task)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger-ghost px-3 py-1.5 text-[13px]"
              onClick={() => onDelete(task)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
