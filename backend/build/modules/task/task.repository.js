"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.findTasks = findTasks;
exports.findTaskById = findTaskById;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const task_model_1 = require("./task.model");
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function buildTaskFilter(options) {
    const filter = {};
    if (options.status) {
        filter.status = options.status;
    }
    if (options.priority) {
        filter.priority = options.priority;
    }
    if (options.search) {
        // Escaped regex gives case-insensitive "contains" search without allowing regex injection.
        const pattern = new RegExp(escapeRegExp(options.search), 'i');
        filter.$or = [{ title: pattern }, { description: pattern }];
    }
    return filter;
}
function createTask(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return task_model_1.TaskModel.create(payload);
    });
}
function findTasks(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = buildTaskFilter(options);
        const skip = (options.page - 1) * options.limit;
        const sort = {
            [options.sortBy]: options.order === 'asc' ? 1 : -1,
        };
        // Stable ordering for equal values in the primary sort field.
        if (options.sortBy !== 'createdAt') {
            sort.createdAt = -1;
        }
        sort._id = options.order === 'asc' ? 1 : -1;
        const [items, total] = yield Promise.all([
            task_model_1.TaskModel.find(filter).sort(sort).skip(skip).limit(options.limit).lean(),
            task_model_1.TaskModel.countDocuments(filter),
        ]);
        return { items, total };
    });
}
function findTaskById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return task_model_1.TaskModel.findById(id).lean();
    });
}
function updateTask(id, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        return task_model_1.TaskModel.findByIdAndUpdate(id, payload, {
            returnDocument: 'after',
            runValidators: true,
        }).lean();
    });
}
function deleteTask(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return task_model_1.TaskModel.findByIdAndDelete(id).lean();
    });
}
