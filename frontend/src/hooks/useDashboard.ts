import { useEffect, useState } from 'react';

import { fetchDashboard } from '../services/tasks';
import type { DashboardStats } from '../types';

export interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(refreshKey: number): DashboardState {
  const [state, setState] = useState<DashboardState>({ stats: null, loading: true, error: null });

  useEffect(() => {
    let active = true;

    const load = async () => {
      // Yield once so state updates stay out of the effect's synchronous window.
      await Promise.resolve();

      setState((prev) => ({ ...prev, loading: true }));

      fetchDashboard()
        .then((stats) => {
          if (active) {
            setState({ stats, loading: false, error: null });
          }
        })
        .catch((error: unknown) => {
          if (active) {
            setState({
              stats: null,
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to load dashboard stats',
            });
          }
        });
    };

    void load();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  return state;
}
