import { useEffect, useState } from 'react';

import { fetchTasks } from '../services/tasks';
import type { Task } from '../types';

export interface LatestTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

/** Fetches the 5 most recently created tasks, used by the dashboard view. */
export function useLatestTasks(refreshKey: number, active: boolean): LatestTasksState {
  const [state, setState] = useState<LatestTasksState>({ tasks: [], loading: true, error: null });

  useEffect(() => {
    if (!active) {
      return;
    }
    let isValid = true;

    const load = async () => {
      // Yield once so state updates stay out of the effect's synchronous window.
      await Promise.resolve();
      if (!isValid) {
        return;
      }
      setState((prev) => ({ ...prev, loading: true }));

      try {
        const { items } = await fetchTasks({
          search: '',
          status: '',
          priority: '',
          sortBy: 'createdAt',
          order: 'desc',
          page: 1,
          limit: 5,
        });
        if (!isValid) {
          return;
        }
        setState({ tasks: items, loading: false, error: null });
      } catch (loadError) {
        if (!isValid) {
          return;
        }
        setState({
          tasks: [],
          loading: false,
          error: loadError instanceof Error
            ? loadError.message
            : 'Failed to load recent tasks',
        });
      }
    };

    void load();

    return () => {
      isValid = false;
    };
  }, [active, refreshKey]);

  return state;
}
