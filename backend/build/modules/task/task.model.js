"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModel = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../common/constants");
const taskSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [120, 'Title must be at most 120 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description must be at most 2000 characters'],
        default: '',
    },
    priority: {
        type: String,
        enum: {
            values: [...constants_1.TASK_PRIORITIES],
            message: `Priority must be one of: ${constants_1.TASK_PRIORITIES.join(', ')}`,
        },
        default: 'medium',
    },
    status: {
        type: String,
        enum: {
            values: [...constants_1.TASK_STATUSES],
            message: `Status must be one of: ${constants_1.TASK_STATUSES.join(', ')}`,
        },
        default: 'pending',
    },
}, {
    timestamps: true,
    versionKey: false,
});
// Supports the most common list query: filter by status/priority, newest first.
taskSchema.index({ status: 1, priority: 1, createdAt: -1 });
exports.TaskModel = (0, mongoose_1.model)('Task', taskSchema);
