"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
exports.formatZodIssues = formatZodIssues;
const errors_1 = require("./errors");
/**
 * Converts Zod issues into a flat `{ field, message }` list so clients get
 * predictable error payloads without depending on Zod's internal shape.
 */
function formatZodIssues(error) {
    return error.issues.map((issue) => ({
        field: issue.path.length > 0 ? issue.path.join('.') : 'body',
        message: issue.message,
    }));
}
/**
 * Validates `req.body`, `req.query` and/or `req.params` against Zod schemas.
 *
 * Validated output is written to `req.validated` instead of mutating `req.query`,
 * because Express 5 exposes `req.query` as a read-only getter.
 */
const validate = (schemas) => {
    return (req, _res, next) => {
        const validated = Object.assign({}, req.validated);
        for (const target of ['params', 'query', 'body']) {
            const schema = schemas[target];
            if (!schema) {
                continue;
            }
            const result = schema.safeParse(req[target]);
            if (!result.success) {
                next(new errors_1.ValidationError(formatZodIssues(result.error)));
                return;
            }
            validated[target] = result.data;
        }
        req.validated = validated;
        next();
    };
};
exports.validate = validate;
