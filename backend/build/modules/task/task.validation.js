"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTasksQuerySchema = exports.taskIdParamSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../../common/constants");
const titleSchema = zod_1.z
    .string({ error: 'Title must be a string' })
    .trim()
    .min(1, 'Title is required')
    .max(120, 'Title must be at most 120 characters');
const descriptionSchema = zod_1.z
    .string({ error: 'Description must be a string' })
    .trim()
    .max(2000, 'Description must be at most 2000 characters');
const prioritySchema = zod_1.z.enum(constants_1.TASK_PRIORITIES, {
    error: `Priority must be one of: ${constants_1.TASK_PRIORITIES.join(', ')}`,
});
const statusSchema = zod_1.z.enum(constants_1.TASK_STATUSES, {
    error: `Status must be one of: ${constants_1.TASK_STATUSES.join(', ')}`,
});
exports.createTaskSchema = zod_1.z.strictObject({
    title: titleSchema,
    description: descriptionSchema.optional(),
    priority: prioritySchema.optional(),
    priority: statusSchema.optional(),
});
exports.updateTaskSchema = zod_1.z
    .strictObject({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    priority: prioritySchema.optional(),
    status: statusSchema.optional(),
})
    .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
});
exports.taskIdParamSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task id'),
});
exports.listTasksQuerySchema = zod_1.z.object({
    search: zod_1.z
        .string({ error: 'Search must be a string' })
        .trim()
        .max(100, 'Search must be at most 100 characters')
        .optional(),
    status: statusSchema.optional(),
    priority: prioritySchema.optional(),
    page: zod_1.z.coerce
        .number({ error: 'Page must be a number' })
        .int('Page must be an integer')
        .min(1, 'Page must be at least 1')
        .default(constants_1.DEFAULT_PAGE),
    limit: zod_1.z.coerce
        .number({ error: 'Limit must be a number' })
        .int('Limit must be an integer')
        .min(1, 'Limit must be at least 1')
        .max(constants_1.MAX_LIMIT, `Limit must be at most ${constants_1.MAX_LIMIT}`)
        .default(constants_1.DEFAULT_LIMIT),
    sortBy: zod_1.z.enum(constants_1.TASK_SORT_FIELDS).default('createdAt'),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
