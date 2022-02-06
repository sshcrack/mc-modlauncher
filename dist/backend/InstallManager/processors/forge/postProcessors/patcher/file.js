"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStdoutFile = exports.getClassPathJar = void 0;
const path_1 = __importDefault(require("path"));
const mainGlobals_1 = require("../../../../../../Globals/mainGlobals");
function getClassPathJar() {
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    const temp = mainGlobals_1.MainGlobals.getTempDir(installDir);
    return path_1.default.join(temp, "classpath.jar");
}
exports.getClassPathJar = getClassPathJar;
function getStdoutFile(jar) {
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    const logDir = path_1.default.join(installDir, "logs");
    const replaceRegex = /[^a-zA-Z0-9\\.\\-]/g;
    const fsFriendly = jar.replace(replaceRegex, "-");
    return path_1.default.join(logDir, `${fsFriendly}.log`);
}
exports.getStdoutFile = getStdoutFile;
//# sourceMappingURL=file.js.map