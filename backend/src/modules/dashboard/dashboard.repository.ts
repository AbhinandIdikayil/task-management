import { TaskModel } from '../task/task.model';
import type { DashboardStats, TaskStatus } from '../task/task.types';
import { TASK_STATUSES } from '../../common/constants';

/**
 * One aggregation instead of four count queries, so the dashboard stays cheap
 * as the collection grows.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const rows = await TaskModel.aggregate<{ _id: TaskStatus; count: number }>([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = Object.fromEntries(TASK_STATUSES.map((status) => [status, 0])) as Record<
    TaskStatus,
    number
  >;

  for (const row of rows) {
    if (row._id in counts) {
      counts[row._id] = row.count;
    }
  }

  const total = counts.pending + counts.in_progress + counts.completed;
  const completed = counts.completed;

  return {
    total,
    pending: counts.pending,
    inProgress: counts.in_progress,
    completed,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}
