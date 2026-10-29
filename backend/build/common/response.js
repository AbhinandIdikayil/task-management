"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, message = 'Success', statusCode = 200, meta) {
    const body = { success: true, message, data };
    if (meta !== undefined) {
        body.meta = meta;
    }
    return res.status(statusCode).json(body);
}
function sendError(res, statusCode, message, details) {
    const body = { success: false, message };
    if (details !== undefined) {
        body.details = details;
    }
    return res.status(statusCode).json(body);
}
