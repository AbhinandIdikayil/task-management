import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { ApiError } from '../lib/api';
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '../types';
import type { Task, TaskPatch, TaskPayload, TaskPriority, TaskStatus } from '../types';

interface Props {
  /** `null` opens the form in create mode. */
  task: Task | null;
  onSubmit(payload: TaskPayload | TaskPatch): Promise<void>;
  onClose(): void;
}

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;
const EDITABLE_FIELDS = ['title', 'description', 'priority', 'status'] as const;

/** Mirrors the API rules (see task.validation.ts in the backend). */
const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required.')
    .max(MAX_TITLE_LENGTH, `Title must be at most ${MAX_TITLE_LENGTH} characters.`),
  description: z
    .string()
    .trim()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
    ),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
});

type FormValues = z.infer<typeof taskFormSchema>;
type FormField = (typeof EDITABLE_FIELDS)[number];

function isFormField(value: string): value is FormField {
  return (EDITABLE_FIELDS as readonly string[]).includes(value);
}

export default function TaskFormModal({ task, onSubmit, onClose }: Props) {
  const isEdit = task !== null;

  // Field snapshot captured when the modal opened, used for change detection.
  const initial = useMemo(
    () => ({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? ('medium' as TaskPriority),
      status: task?.status ?? ('pending' as TaskStatus),
    }),
    [task],
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initial,
    mode: 'onTouched',
  });

  const descriptionValue = useWatch({ control, name: 'description' });
  const descriptionLength = (descriptionValue ?? '').length;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSubmitting, onClose]);

  const submitHandler = handleSubmit(async (values) => {
    clearErrors('root.server');

    let payload: TaskPayload | TaskPatch;

    if (isEdit) {
      // PATCH body contains only the fields the user actually changed.
      const patch: TaskPatch = {};
      if (values.title !== initial.title.trim()) {
        patch.title = values.title;
      }
      if (values.description !== initial.description.trim()) {
        patch.description = values.description;
      }
      if (values.priority !== initial.priority) {
        patch.priority = values.priority;
      }
      if (values.status !== initial.status) {
        patch.status = values.status;
      }
      payload = patch;
    } else {
      payload = {
        title: values.title,
        priority: values.priority,
        status: values.status,
        ...(values.description ? { description: values.description } : {}),
      };
    }

    if (isEdit && Object.keys(payload).length === 0) {
      // Nothing actually changed after trimming — close without a request.
      onClose();
      return;
    }

    try {
      await onSubmit(payload);
      onClose();
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        // Map API field errors (details: [{field, message}]) onto the form,
        // everything else lands in the form-level root.server error.
        let mappedFieldError = false;

        for (const detail of submitError.details ?? []) {
          if (detail.field && isFormField(detail.field)) {
            setError(detail.field, { type: 'server', message: detail.message });
            mappedFieldError = true;
          }
        }

        if (!mappedFieldError) {
          setError('root.server', { type: 'server', message: submitError.message });
        }
      } else {
        setError('root.server', {
          type: 'server',
          message: 'Something went wrong. Please try again.',
        });
      }
    }
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
      >
        <header className="flex items-center justify-between px-6 pt-5">
          <h2 id="task-form-title" className="m-0 font-display text-xl font-bold tracking-tight">
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="cursor-pointer rounded-md border-none bg-transparent p-1 text-2xl leading-none text-ink/55 hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <form className="flex flex-col gap-4 px-6 py-5" onSubmit={submitHandler} noValidate>
          {errors.root?.server && (
            <div className="banner-error" role="alert">
              {errors.root.server.message}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-title" className="field-label">
              <span>
                Title <em className="text-rose-600 not-italic" aria-hidden="true">*</em>
              </span>
            </label>
            <input
              id="task-title"
              {...register('title')}
              className="field-input"
              aria-invalid={Boolean(errors.title)}
              placeholder="What needs to be done?"
              autoFocus
            />
            {errors.title && (
              <p className="field-error" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-description" className="field-label">
              <span>Description</span>
              <span className="text-xs font-medium text-ink/60 tabular-nums">
                {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </label>
            <textarea
              id="task-description"
              {...register('description')}
              className="field-input min-h-24 resize-y"
              aria-invalid={Boolean(errors.description)}
              placeholder="Add more details (optional)"
              rows={4}
            />
            {errors.description && (
              <p className="field-error" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-status" className="field-label">
                Status
              </label>
              <select id="task-status" className="field-input" {...register('status')}>
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-priority" className="field-label">
                Priority
              </label>
              <select id="task-priority" className="field-input" {...register('priority')}>
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {TASK_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-1 flex justify-end gap-2.5">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || (isEdit && !isDirty)}
            >
              {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
