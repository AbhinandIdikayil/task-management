import { request } from '../lib/api';
import type {
  DashboardStats,
  PaginationMeta,
  Task,
  TaskFilters,
  TaskPatch,
  TaskPayload,
} from '../types';

const PAGE_SIZE_LIMIT = 100;

export async function fetchDashboard(): Promise<DashboardStats> {
  const { data } = await request<DashboardStats>('/api/dashboard');
  return data;
}

export interface TaskListResult {
  items: Task[];
  meta: PaginationMeta | null;
}

export async function fetchTasks(
  filters: Omit<TaskFilters, 'search'> & { search: string; limit: number },
): Promise<TaskListResult> {
  const params = new URLSearchParams();

  const search = filters.search.trim();
  if (search) {
    params.set('search', search);
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.priority) {
    params.set('priority', filters.priority);
  }

  params.set('sortBy', filters.sortBy);
  params.set('order', filters.order);
  params.set('page', String(Math.max(1, filters.page)));
  params.set('limit', String(Math.min(filters.limit, PAGE_SIZE_LIMIT)));

  const { data, meta } = await request<Task[]>(`/api/tasks?${params.toString()}`);
  return { items: data, meta: (meta as PaginationMeta | undefined) ?? null };
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const { data } = await request<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  const { data } = await request<Task>(`/api/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await request<null>(`/api/tasks/${id}`, { method: 'DELETE' });
}
