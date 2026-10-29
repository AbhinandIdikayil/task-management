/** Domain types mirroring the Task Manager API (`backend/src/common/constants.ts`). */

export const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export const TASK_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'priority', 'status'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

/** Body sent to POST /api/tasks and PATCH /api/tasks/:id. */
export interface TaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
}

/** Body sent to PATCH /api/tasks/:id — only the fields to change. */
export interface TaskPatch {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

/** Query state for GET /api/tasks (empty strings mean "no filter"). */
export interface TaskFilters {
  search: string;
  status: TaskStatus | '';
  priority: TaskPriority | '';
  sortBy: TaskSortField;
  order: 'asc' | 'desc';
  page: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const TASK_SORT_LABELS: Record<TaskSortField, string> = {
  createdAt: 'Created date',
  updatedAt: 'Updated date',
  title: 'Title',
  priority: 'Priority',
  status: 'Status',
};
