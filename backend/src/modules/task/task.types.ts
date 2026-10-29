import type { TASK_PRIORITIES, TASK_SORT_FIELDS, TASK_STATUSES } from '../../common/constants';

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

export interface Task {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskListOptions {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page: number;
  limit: number;
  sortBy: TaskSortField;
  order: 'asc' | 'desc';
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
