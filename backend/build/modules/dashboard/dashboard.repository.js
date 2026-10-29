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
exports.getDashboardStats = getDashboardStats;
const task_model_1 = require("../task/task.model");
const constants_1 = require("../../common/constants");
/**
 * One aggregation instead of four count queries, so the dashboard stays cheap
 * as the collection grows.
 */
function getDashboardStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = yield task_model_1.TaskModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);
        const counts = Object.fromEntries(constants_1.TASK_STATUSES.map((status) => [status, 0]));
        for (const row of rows) {
            if (row._id in counts) {
                counts[row._id] = row.count;
            }
        }
        const total = counts.pending + counts.in_progress + counts.completed;
        const completed = counts.completed;
        return {
            total,
            pending: counts.pending,
            inProgress: counts.in_progress,
            completed,
            completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
        };
    });
}
