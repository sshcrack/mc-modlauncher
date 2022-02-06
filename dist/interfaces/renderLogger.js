"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderLogger = void 0;
if (typeof window === "undefined")
    throw new Error("RenderLogger can only be used in the rendering process.");
class RenderLogger {
    static formatScope(arr) {
        return arr.join(":");
    }
    static get(...name) {
        const logger = window.log
            .scope(RenderLogger.formatScope(name));
        return logger;
    }
}
exports.RenderLogger = RenderLogger;
//# sourceMappingURL=renderLogger.js.map