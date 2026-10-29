import { useCallback, useState } from 'react';

import ConfirmDialog from './components/ConfirmDialog';
import DashboardStats from './components/DashboardStats';
import Pagination from './components/Pagination';
import TaskFormModal from './components/TaskFormModal';
import TaskList from './components/TaskList';
import TaskToolbar from './components/TaskToolbar';
import Toast, { type ToastMessage } from './components/Toast';
import { useDashboard } from './hooks/useDashboard';
import { useTasks } from './hooks/useTasks';
import { createTask, deleteTask, updateTask } from './services/tasks';
import type { Task, TaskPatch, TaskPayload } from './types';

interface ToastState {
  id: number;
  toast: ToastMessage;
}

export default function App() {
  // Bumped after every mutation so the task list and dashboard refetch.
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const dashboard = useDashboard(refreshKey);
  const {
    filters,
    items,
    meta,
    loading,
    error,
    updateFilters,
    goToPage,
    reload,
  } = useTasks(refreshKey);

  const showToast = useCallback((newToast: ToastMessage) => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, toast: newToast }));
  }, []);

  const handleTaskSubmit = useCallback(
    async (target: Task | null, payload: TaskPayload | TaskPatch) => {
      if (target) {
        await updateTask(target._id, payload);
      } else {
        // Create mode always sends the full body (guaranteed by the form modal).
        await createTask(payload as TaskPayload);
      }

      showToast({
        type: 'success',
        message: target ? 'Task updated successfully' : 'Task created successfully',
      });

      // New tasks go to the default view so they are visible right away.
      if (!target) {
        updateFilters({ search: '', status: '', priority: '' });
      }
      setRefreshKey((key) => key + 1);
    },
    [showToast, updateFilters],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingTask) {
      return;
    }

    setDeleteBusy(true);
    try {
      await deleteTask(deletingTask._id);
      showToast({ type: 'success', message: `Deleted task "${deletingTask.title}"` });
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      showToast({
        type: 'error',
        message: deleteError instanceof Error ? deleteError.message : 'Failed to delete task',
      });
    } finally {
      setDeleteBusy(false);
      setDeletingTask(null);
    }
  }, [deletingTask, showToast]);

  const hasFilters =
    filters.search !== '' || filters.status !== '' || filters.priority !== '';

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="m-0 font-display text-3xl font-extrabold tracking-tight">Task manager</h1>
          <p className="m-0 mt-1 text-[15px] text-ink/70">Track, organize and finish your work.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          + Add task
        </button>
      </header>

      <DashboardStats stats={dashboard.stats} loading={dashboard.loading} error={dashboard.error} />

      <main>
        <TaskToolbar filters={filters} onChange={updateFilters} />

        <TaskList
          tasks={items}
          loading={loading}
          error={error}
          hasFilters={hasFilters}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
          onReload={reload}
          onClearFilters={() => updateFilters({ search: '', status: '', priority: '' })}
          onCreate={() => setCreateOpen(true)}
        />

        <Pagination meta={meta} onPageChange={goToPage} />
      </main>

      {createOpen && (
        <TaskFormModal
          task={null}
          onSubmit={(payload) => handleTaskSubmit(null, payload)}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {editingTask && (
        <TaskFormModal
          task={editingTask}
          onSubmit={(payload) => handleTaskSubmit(editingTask, payload)}
          onClose={() => setEditingTask(null)}
        />
      )}

      {deletingTask && (
        <ConfirmDialog
          title="Delete task?"
          message={`Delete "${deletingTask.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          busy={deleteBusy}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingTask(null)}
        />
      )}

      {toast && (
        <Toast
          key={toast.id}
          toast={toast.toast}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
