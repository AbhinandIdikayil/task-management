import { Router } from 'express';

import { validate } from '../../common/validation';
import * as taskController from './task.controller';
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  updateTaskSchema,
} from './task.validation';

const taskRouter = Router();

taskRouter
  .route('/')
  .get(validate({ query: listTasksQuerySchema }), taskController.listTasks)
  .post(validate({ body: createTaskSchema }), taskController.createTask);

taskRouter
  .route('/:id')
  .get(validate({ params: taskIdParamSchema }), taskController.getTaskById)
  .patch(
    validate({ params: taskIdParamSchema, body: updateTaskSchema }),
    taskController.updateTask,
  )
  .delete(validate({ params: taskIdParamSchema }), taskController.deleteTask);

export default taskRouter;
