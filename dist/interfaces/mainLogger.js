"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainLogger = void 0;
const electron_log_1 = __importDefault(require("electron-log"));
electron_log_1.default.transports.file.maxSize = 1024 * 1024 * 20;
if (typeof window !== "undefined")
    throw new Error("MainLogger can only be used in the main process.");
class MainLogger {
    static formatScope(arr) {
        return arr.join(":");
    }
    static get(...name) {
        const logger = electron_log_1.default
            .scope(MainLogger.formatScope(name));
        return logger;
    }
}
exports.MainLogger = MainLogger;
//# sourceMappingURL=mainLogger.js.map