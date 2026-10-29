/**
 * Domain constants shared by the Mongoose model, Zod schemas and repositories.
 * Keeping them in one place means the DB layer and the API layer can never drift apart.
 */

export const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export const TASK_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'priority', 'status'] as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;
