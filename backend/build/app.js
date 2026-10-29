"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_handler_1 = require("./common/error-handler");
const request_logger_1 = require("./common/request-logger");
const env_1 = require("./config/env");
const dashboard_route_1 = __importDefault(require("./modules/dashboard/dashboard.route"));
const task_route_1 = __importDefault(require("./modules/task/task.route"));
function getCorsOrigin() {
    if (env_1.env.CORS_ORIGIN === '*') {
        return true;
    }
    return env_1.env.CORS_ORIGIN.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
}
function createApp() {
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    app.use((0, cors_1.default)({ origin: getCorsOrigin() }));
    app.use(express_1.default.json({ limit: '100kb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '100kb' }));
    if (!env_1.env.isTest) {
        app.use(request_logger_1.requestLogger);
    }
    app.get('/', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Task Manager API',
            data: {
                version: '1.0.0',
                endpoints: {
                    health: 'GET /health',
                    tasks: 'GET | POST /api/tasks',
                    task: 'GET | PATCH | DELETE /api/tasks/:id',
                    dashboard: 'GET /api/dashboard',
                },
            },
        });
    });
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'Service healthy',
            data: {
                status: 'ok',
                database: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
                uptime: Math.round(process.uptime()),
                timestamp: new Date().toISOString(),
            },
        });
    });
    app.use('/api/tasks', task_route_1.default);
    app.use('/api/dashboard', dashboard_route_1.default);
    app.use(error_handler_1.notFoundHandler);
    app.use(error_handler_1.errorHandler);
    return app;
}
