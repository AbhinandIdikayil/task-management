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
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, db_1.connectDB)();
        const app = (0, app_1.createApp)();
        app.listen(env_1.env.PORT, () => {
            console.log(`Task Manager API listening on http://localhost:${env_1.env.PORT} (${env_1.env.NODE_ENV})`);
        });
        process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            console.log('\n[SIGINT Received] Cleaning up resources...');
            yield (0, db_1.disconnectDB)();
            console.log('Cleanup complete. Exiting.');
            process.exit(0);
        }));
        process.on('SIGTERM', () => __awaiter(this, void 0, void 0, function* () {
            console.log('\n[SIGTERM Received] Cleaning up resources...');
            yield (0, db_1.disconnectDB)();
            console.log('Cleanup complete. Exiting.');
            process.exit(0);
        }));
        process.on('unhandledRejection', (reason) => {
            console.error('Unhandled promise rejection:', reason);
        });
    });
}
bootstrap().catch((error) => __awaiter(void 0, void 0, void 0, function* () {
    console.error('Failed to start the server:', error);
    yield (0, db_1.disconnectDB)();
    process.exit(1);
}));
