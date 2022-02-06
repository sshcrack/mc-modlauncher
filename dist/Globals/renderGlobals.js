"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderGlobals = void 0;
const _1 = require(".");
const renderLogger_1 = require("../interfaces/renderLogger");
const logger = renderLogger_1.RenderLogger.get("Globals", "renderGlobals");
const { preferences, modpack } = window.api;
class RenderGlobals {
    static getInstallDir() {
        return preferences.get("install_dir");
    }
    static hasLatest(id, config) {
        const currently = modpack.version(id);
        const latest = _1.Globals.getLastVersion(config);
        logger.debug("Has Latest for id", id, "Currently", currently === null || currently === void 0 ? void 0 : currently.id, "Latest", latest === null || latest === void 0 ? void 0 : latest.id);
        return (currently === null || currently === void 0 ? void 0 : currently.id) === (latest === null || latest === void 0 ? void 0 : latest.id);
    }
}
exports.RenderGlobals = RenderGlobals;
//# sourceMappingURL=renderGlobals.js.map