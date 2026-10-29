import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_SORT_FIELDS,
  TASK_SORT_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '../types';
import type { TaskFilters, TaskPriority, TaskSortField, TaskStatus } from '../types';

interface Props {
  filters: TaskFilters;
  onChange(patch: Partial<TaskFilters>): void;
}

export default function TaskToolbar({ filters, onChange }: Props) {
  const hasActiveFilters =
    filters.search !== '' || filters.status !== '' || filters.priority !== '';

  return (
    <section
      aria-label="Search and filter tasks"
      className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-ink/10 bg-white p-4"
    >
      <div className="flex min-w-[220px] flex-1 basis-56 flex-col gap-1.5">
        <label htmlFor="task-search" className="field-label">
          Search
        </label>
        <input
          id="task-search"
          type="search"
          className="field-input"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Title or description…"
        />
      </div>

      <div className="flex w-40 flex-col gap-1.5">
        <label htmlFor="filter-status" className="field-label">
          Status
        </label>
        <select
          id="filter-status"
          className="field-input"
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value as TaskStatus | '' })}
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-36 flex-col gap-1.5">
        <label htmlFor="filter-priority" className="field-label">
          Priority
        </label>
        <select
          id="filter-priority"
          className="field-input"
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value as TaskPriority | '' })}
        >
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {TASK_PRIORITY_LABELS[priority]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-56 flex-col gap-1.5">
        <label htmlFor="sort-tasks" className="field-label">
          Sort
        </label>
        <select
          id="sort-tasks"
          className="field-input"
          value={`${filters.sortBy}-${filters.order}`}
          onChange={(event) => {
            const [sortBy, order] = event.target.value.split('-') as [TaskSortField, 'asc' | 'desc'];
            onChange({ sortBy, order });
          }}
        >
          {TASK_SORT_FIELDS.flatMap((field) => [
            <option key={`${field}-desc`} value={`${field}-desc`}>
              {TASK_SORT_LABELS[field]} (descending)
            </option>,
            <option key={`${field}-asc`} value={`${field}-asc`}>
              {TASK_SORT_LABELS[field]} (ascending)
            </option>,
          ])}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => onChange({ search: '', status: '', priority: '' })}
        >
          Clear filters
        </button>
      )}
    </section>
  );
}
