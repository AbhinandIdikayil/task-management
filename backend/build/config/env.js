"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().max(65535).default(5000),
    MONGODB_URI: zod_1.z
        .string()
        .trim()
        .min(1, 'MONGODB_URI cannot be empty')
        .default('mongodb://127.0.0.1:27017/task_manager'),
    CORS_ORIGIN: zod_1.z.string().trim().default('*'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const issues = parsed.error.issues
        .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
        .join('\n');
    console.error(`Invalid environment variables:\n${issues}`);
    process.exit(1);
}
exports.env = Object.assign(Object.assign({}, parsed.data), { isProduction: parsed.data.NODE_ENV === 'production', isTest: parsed.data.NODE_ENV === 'test' });
