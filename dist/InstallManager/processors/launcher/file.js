"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLauncherExe = exports.getLauncherDir = exports.getLauncherZip = void 0;
const path_1 = __importDefault(require("path"));
const Globals_1 = require("../../../Globals");
const mainGlobals_1 = require("../../../Globals/mainGlobals");
function getLauncherZip() {
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    const tempDir = Globals_1.Globals.getTempDir(installDir);
    return path_1.default.join(tempDir, "launcher.zip");
}
exports.getLauncherZip = getLauncherZip;
function getLauncherDir() {
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    return path_1.default.join(installDir, "Launcher");
}
exports.getLauncherDir = getLauncherDir;
function getLauncherExe() {
    const dir = getLauncherDir();
    return path_1.default.join(dir, "MinecraftLauncher.exe");
}
exports.getLauncherExe = getLauncherExe;
//# sourceMappingURL=file.js.map