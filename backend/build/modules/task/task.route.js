"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("../../common/validation");
const taskController = __importStar(require("./task.controller"));
const task_validation_1 = require("./task.validation");
const taskRouter = (0, express_1.Router)();
taskRouter
    .route('/')
    .get((0, validation_1.validate)({ query: task_validation_1.listTasksQuerySchema }), taskController.listTasks)
    .post((0, validation_1.validate)({ body: task_validation_1.createTaskSchema }), taskController.createTask);
taskRouter
    .route('/:id')
    .get((0, validation_1.validate)({ params: task_validation_1.taskIdParamSchema }), taskController.getTaskById)
    .patch((0, validation_1.validate)({ params: task_validation_1.taskIdParamSchema, body: task_validation_1.updateTaskSchema }), taskController.updateTask)
    .delete((0, validation_1.validate)({ params: task_validation_1.taskIdParamSchema }), taskController.deleteTask);
exports.default = taskRouter;
