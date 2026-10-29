import { useCallback, useState } from 'react';

import ConfirmDialog from './components/ConfirmDialog';
import DashboardView from './components/DashboardView';
import Pagination from './components/Pagination';
import Sidebar, { TopNav } from './components/Sidebar';
import TaskFormModal from './components/TaskFormModal';
import TaskList from './components/TaskList';
import TaskToolbar from './components/TaskToolbar';
import Toast, { type ToastMessage } from './components/Toast';
import { useDashboard } from './hooks/useDashboard';
import { useLatestTasks } from './hooks/useLatestTasks';
import { useTasks } from './hooks/useTasks';
import { createTask, deleteTask, updateTask } from './services/tasks';
import type { Task, TaskPatch, TaskPayload, ViewName } from './types';

interface ToastState {
  id: number;
  toast: ToastMessage;
}

export default function App() {
  const [view, setView] = useState<ViewName>('dashboard');

  // Bumped after every mutation so the task list, dashboard and latest feed refetch.
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const dashboard = useDashboard(refreshKey);
  const latest = useLatestTasks(refreshKey, view === 'dashboard');
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

  const navProps = {
    view,
    onViewChange: setView,
    taskCount: dashboard.stats?.total ?? null,
  };

  return (
    <div className="flex min-h-dvh">
      <Sidebar {...navProps} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav {...navProps} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-6 md:pt-8">
          {view === 'dashboard' ? (
            <DashboardView
              stats={dashboard.stats}
              statsLoading={dashboard.loading}
              statsError={dashboard.error}
              latest={latest.tasks}
              latestLoading={latest.loading}
              latestError={latest.error}
              onViewAll={() => setView('tasks')}
            />
          ) : (
            <>
              <section className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <h2 className="m-0 font-display text-2xl font-extrabold tracking-tight">Tasks</h2>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCreateOpen(true)}
                >
                  + Add task
                </button>
              </section>

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
            </>
          )}
        </main>
      </div>

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
