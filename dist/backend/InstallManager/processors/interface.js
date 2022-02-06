"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceVersion = exports.getInstanceVersionPath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mainGlobals_1 = require("../../../Globals/mainGlobals");
const mainLogger_1 = require("../../../interfaces/mainLogger");
const logger = mainLogger_1.MainLogger.get("InstallManager", "Processors", "Interface");
function getInstanceVersionPath(id) {
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    const instanceDir = mainGlobals_1.MainGlobals.getInstancePathById(installDir, id);
    return path_1.default.join(instanceDir, "installed_version.json");
}
exports.getInstanceVersionPath = getInstanceVersionPath;
function getInstanceVersion(id) {
    const filePath = getInstanceVersionPath(id);
    const exists = fs_1.default.existsSync(filePath);
    if (!exists)
        return;
    const version = JSON.parse(fs_1.default.readFileSync(filePath, "utf8"));
    logger.debug("Version for", id, "is", version);
    return version;
}
exports.getInstanceVersion = getInstanceVersion;
//# sourceMappingURL=interface.js.map