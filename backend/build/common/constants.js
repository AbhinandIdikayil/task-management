"use strict";
/**
 * Domain constants shared by the Mongoose model, Zod schemas and repositories.
 * Keeping them in one place means the DB layer and the API layer can never drift apart.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_LIMIT = exports.DEFAULT_LIMIT = exports.DEFAULT_PAGE = exports.TASK_SORT_FIELDS = exports.TASK_PRIORITIES = exports.TASK_STATUSES = void 0;
exports.TASK_STATUSES = ['pending', 'in_progress', 'completed'];
exports.TASK_PRIORITIES = ['low', 'medium', 'high'];
exports.TASK_SORT_FIELDS = ['createdAt', 'updatedAt', 'title', 'priority', 'status'];
exports.DEFAULT_PAGE = 1;
exports.DEFAULT_LIMIT = 10;
exports.MAX_LIMIT = 100;
