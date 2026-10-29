import { z } from 'zod';

import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  MAX_LIMIT,
  TASK_PRIORITIES,
  TASK_SORT_FIELDS,
  TASK_STATUSES,
} from '../../common/constants';

const titleSchema = z
  .string({ error: 'Title must be a string' })
  .trim()
  .min(1, 'Title is required')
  .max(120, 'Title must be at most 120 characters');

const descriptionSchema = z
  .string({ error: 'Description must be a string' })
  .trim()
  .max(2000, 'Description must be at most 2000 characters');

const prioritySchema = z.enum(TASK_PRIORITIES, {
  error: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
});

const statusSchema = z.enum(TASK_STATUSES, {
  error: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
});

export const createTaskSchema = z.strictObject({
  title: titleSchema,
  description: descriptionSchema.optional(),
  priority: prioritySchema.optional(),
  priority: statusSchema.optional(),
});

export const updateTaskSchema = z
  .strictObject({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    priority: prioritySchema.optional(),
    status: statusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  });

export const taskIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task id'),
});

export const listTasksQuerySchema = z.object({
  search: z
    .string({ error: 'Search must be a string' })
    .trim()
    .max(100, 'Search must be at most 100 characters')
    .optional(),
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  page: z.coerce
    .number({ error: 'Page must be a number' })
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(DEFAULT_PAGE),
  limit: z.coerce
    .number({ error: 'Limit must be a number' })
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(MAX_LIMIT, `Limit must be at most ${MAX_LIMIT}`)
    .default(DEFAULT_LIMIT),
  sortBy: z.enum(TASK_SORT_FIELDS).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTaskPayload = z.infer<typeof createTaskSchema>;
export type UpdateTaskPayload = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type TaskIdParams = z.infer<typeof taskIdParamSchema>;
