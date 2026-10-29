import { model, Schema } from 'mongoose';

import { TASK_PRIORITIES, TASK_STATUSES } from '../../common/constants';
import type { Task } from './task.types';

const taskSchema = new Schema<Task>(
  {
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
        values: [...TASK_PRIORITIES],
        message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: [...TASK_STATUSES],
        message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Supports the most common list query: filter by status/priority, newest first.
taskSchema.index({ status: 1, priority: 1, createdAt: -1 });

export const TaskModel = model<Task>('Task', taskSchema);
