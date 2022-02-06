"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassPathJar = void 0;
const Globals_1 = require("../../../../../Globals");
const mainGlobals_1 = require("../../../../../Globals/mainGlobals");
const path_1 = __importDefault(require("path"));
function getClassPathJar() {
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    const temp = Globals_1.Globals.getTempDir(installDir);
    return path_1.default.join(temp, "classpath.jar");
}
exports.getClassPathJar = getClassPathJar;
//# sourceMappingURL=file.js.map