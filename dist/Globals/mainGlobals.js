"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainGlobals = void 0;
const main_1 = require("../pages/preferences/main");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class MainGlobals {
    static getInstallDir() {
        return main_1.store.get("install_dir");
    }
    static getTempDir(installDir, shouldDelete = false) {
        const tempPath = path_1.default.join(installDir, "temp");
        if (fs_1.default.existsSync(tempPath) && shouldDelete)
            fs_1.default.rmSync(tempPath, { recursive: true, force: true });
        if (!fs_1.default.existsSync(tempPath))
            fs_1.default.mkdirSync(tempPath);
        return tempPath;
    }
    static getInstanceDir(installDir) {
        return path_1.default.join(installDir, "Instances");
    }
    static getInstancePathById(installDir, id) {
        return path_1.default.join(this.getInstanceDir(installDir), id);
    }
    static getCreatingFile(installDir, id) {
        const dir = MainGlobals.getInstancePathById(installDir, id);
        return path_1.default.join(dir, ".creating");
    }
}
exports.MainGlobals = MainGlobals;
//# sourceMappingURL=mainGlobals.js.map