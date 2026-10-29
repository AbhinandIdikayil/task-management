import type { Request, Response } from 'express';

import { NotFoundError } from '../../common/errors';
import { sendSuccess } from '../../common/response';
import * as taskRepository from './task.repository';
import type { PaginationMeta } from './task.types';
import type {
  CreateTaskPayload,
  ListTasksQuery,
  TaskIdParams,
  UpdateTaskPayload,
} from './task.validation';

export async function createTask(req: Request, res: Response): Promise<void> {
  const payload = req.validated?.body as CreateTaskPayload;

  const task = await taskRepository.createTask(payload);

  sendSuccess(res, task, 'Task created successfully', 201);
}

export async function listTasks(req: Request, res: Response): Promise<void> {
  const query = req.validated?.query as ListTasksQuery;

  const { items, total } = await taskRepository.findTasks(query);

  const totalPages = Math.ceil(total / query.limit);
  const meta: PaginationMeta = {
    total,
    page: query.page,
    limit: query.limit,
    totalPages,
    hasNextPage: query.page < totalPages,
    hasPrevPage: query.page > 1,
  };

  sendSuccess(res, items, 'Tasks fetched successfully', 200, meta);
}

export async function getTaskById(req: Request, res: Response): Promise<void> {
  const { id } = req.validated?.params as TaskIdParams;

  const task = await taskRepository.findTaskById(id);

  if (!task) {
    throw new NotFoundError(`Task with id "${id}" not found`);
  }

  sendSuccess(res, task, 'Task fetched successfully');
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const { id } = req.validated?.params as TaskIdParams;
  const payload = req.validated?.body as UpdateTaskPayload;

  const task = await taskRepository.updateTask(id, payload);

  if (!task) {
    throw new NotFoundError(`Task with id "${id}" not found`);
  }

  sendSuccess(res, task, 'Task updated successfully');
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const { id } = req.validated?.params as TaskIdParams;

  const task = await taskRepository.deleteTask(id);

  if (!task) {
    throw new NotFoundError(`Task with id "${id}" not found`);
  }

  sendSuccess(res, null, 'Task deleted successfully');
}
