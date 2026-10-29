import type { QueryFilter } from 'mongoose';

import { TaskModel } from './task.model';
import type { CreateTaskInput, Task, TaskListOptions, UpdateTaskInput } from './task.types';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildTaskFilter(options: Pick<TaskListOptions, 'search' | 'status' | 'priority'>): QueryFilter<Task> {
  const filter: QueryFilter<Task> = {};

  if (options.status) {
    filter.status = options.status;
  }

  if (options.priority) {
    filter.priority = options.priority;
  }

  if (options.search) {
    // Escaped regex gives case-insensitive "contains" search without allowing regex injection.
    const pattern = new RegExp(escapeRegExp(options.search), 'i');
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  return filter;
}

export async function createTask(payload: CreateTaskInput) {
  return TaskModel.create(payload);
}

export async function findTasks(options: TaskListOptions): Promise<{ items: Task[]; total: number }> {
  const filter = buildTaskFilter(options);
  const skip = (options.page - 1) * options.limit;

  const sort: Record<string, 1 | -1> = {
    [options.sortBy]: options.order === 'asc' ? 1 : -1,
  };

  // Stable ordering for equal values in the primary sort field.
  if (options.sortBy !== 'createdAt') {
    sort.createdAt = -1;
  }
  sort._id = options.order === 'asc' ? 1 : -1;

  const [items, total] = await Promise.all([
    TaskModel.find(filter).sort(sort).skip(skip).limit(options.limit).lean<Task[]>(),
    TaskModel.countDocuments(filter),
  ]);

  return { items, total };
}

export async function findTaskById(id: string): Promise<Task | null> {
  return TaskModel.findById(id).lean<Task>();
}

export async function updateTask(id: string, payload: UpdateTaskInput): Promise<Task | null> {
  return TaskModel.findByIdAndUpdate(id, payload, {
    returnDocument: 'after',
    runValidators: true,
  }).lean<Task>();
}

export async function deleteTask(id: string): Promise<Task | null> {
  return TaskModel.findByIdAndDelete(id).lean<Task>();
}
