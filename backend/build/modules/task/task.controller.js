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
exports.listTasks = listTasks;
exports.getTaskById = getTaskById;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const errors_1 = require("../../common/errors");
const response_1 = require("../../common/response");
const taskRepository = __importStar(require("./task.repository"));
function createTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const payload = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.body;
        const task = yield taskRepository.createTask(payload);
        (0, response_1.sendSuccess)(res, task, 'Task created successfully', 201);
    });
}
function listTasks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const query = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.query;
        const { items, total } = yield taskRepository.findTasks(query);
        const totalPages = Math.ceil(total / query.limit);
        const meta = {
            total,
            page: query.page,
            limit: query.limit,
            totalPages,
            hasNextPage: query.page < totalPages,
            hasPrevPage: query.page > 1,
        };
        (0, response_1.sendSuccess)(res, items, 'Tasks fetched successfully', 200, meta);
    });
}
function getTaskById(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { id } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const task = yield taskRepository.findTaskById(id);
        if (!task) {
            throw new errors_1.NotFoundError(`Task with id "${id}" not found`);
        }
        (0, response_1.sendSuccess)(res, task, 'Task fetched successfully');
    });
}
function updateTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { id } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const payload = (_b = req.validated) === null || _b === void 0 ? void 0 : _b.body;
        const task = yield taskRepository.updateTask(id, payload);
        if (!task) {
            throw new errors_1.NotFoundError(`Task with id "${id}" not found`);
        }
        (0, response_1.sendSuccess)(res, task, 'Task updated successfully');
    });
}
function deleteTask(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { id } = (_a = req.validated) === null || _a === void 0 ? void 0 : _a.params;
        const task = yield taskRepository.deleteTask(id);
        if (!task) {
            throw new errors_1.NotFoundError(`Task with id "${id}" not found`);
        }
        (0, response_1.sendSuccess)(res, null, 'Task deleted successfully');
    });
}
