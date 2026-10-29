import Pagination from './Pagination';
import TaskList from './TaskList';
import TaskToolbar from './TaskToolbar';
import type { PaginationMeta, Task, TaskFilters } from '../types';

interface Props {
  filters: TaskFilters;
  onFiltersChange(patch: Partial<TaskFilters>): void;
  items: Task[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  onReload(): void;
  onClearFilters(): void;
  onCreate(): void;
  onEdit(task: Task): void;
  onDelete(task: Task): void;
}

export default function TasksView({
  filters,
  onFiltersChange,
  items,
  meta,
  loading,
  error,
  onReload,
  onClearFilters,
  onCreate,
  onEdit,
  onDelete,
}: Props) {
  const hasActiveFilters =
    filters.search !== '' || filters.status !== '' || filters.priority !== '';

  return (
    <>
      <section className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2 className="m-0 font-display text-2xl font-extrabold tracking-tight">Tasks</h2>
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          + Add task
        </button>
      </section>

      <TaskToolbar filters={filters} onChange={onFiltersChange} />

      <TaskList
        tasks={items}
        loading={loading}
        error={error}
        hasFilters={hasActiveFilters}
        onEdit={onEdit}
        onDelete={onDelete}
        onReload={onReload}
        onClearFilters={onClearFilters}
        onCreate={onCreate}
      />

      <Pagination meta={meta} onPageChange={(page) => onFiltersChange({ page })} />
    </>
  );
}
