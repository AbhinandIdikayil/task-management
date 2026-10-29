import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ApiError } from '../lib/api';
import { fetchTasks } from '../services/tasks';
import { useDebouncedValue } from './useDebouncedValue';
import type { PaginationMeta, Task, TaskFilters } from '../types';

export const TASKS_PAGE_SIZE = 10;

export interface TasksState {
  filters: TaskFilters;
  items: Task[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  updateFilters(patch: Partial<TaskFilters>): void;
  goToPage(page: number): void;
  reload(): void;
}

const INITIAL_FILTERS: TaskFilters = {
  search: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: 1,
};

export function useTasks(refreshKey: number): TasksState {
  const [filters, setFilters] = useState<TaskFilters>(INITIAL_FILTERS);
  const search = useDebouncedValue(filters.search, 350);

  const [items, setItems] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recomputed only when a query input actually changes, so the load effect
  // does not fire on unrelated renders.
  const query = useMemo(
    () => ({
      search,
      status: filters.status,
      priority: filters.priority,
      sortBy: filters.sortBy,
      order: filters.order,
      page: filters.page,
      limit: TASKS_PAGE_SIZE,
    }),
    [search, filters.status, filters.priority, filters.sortBy, filters.order, filters.page],
  );

  // Holds the latest load runner so `reload` can re-trigger a manual refetch.
  const runnerRef = useRef<() => void>(() => {});

  useEffect(() => {
    let active = true;

    const load = async () => {
      // Yield once so the first state updates never run in the synchronous
      // part of this effect.
      await Promise.resolve();
      if (!active) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchTasks(query);

        if (!active) {
          return;
        }
        setItems(result.items);
        setMeta(result.meta);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(
          loadError instanceof ApiError
            ? loadError.message
            : 'Failed to load tasks. Please try again.',
        );
        setItems([]);
        setMeta(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    runnerRef.current = load;
    void load();

    return () => {
      active = false;
    };
  }, [query, refreshKey]);

  const updateFilters = useCallback((patch: Partial<TaskFilters>) => {
    // Any filter change resets pagination.
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const reload = useCallback(() => {
    void runnerRef.current();
  }, []);

  return { filters, items, meta, loading, error, updateFilters, goToPage, reload };
}
