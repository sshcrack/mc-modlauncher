"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForgeDir = exports.getForgeInstallerZip = exports.getForgeInstallProfile = exports.getInstallZip = exports.getLibrariesDir = exports.getVersionManifest = exports.getVersionJar = exports.getVersionsDir = exports.getLauncherMC = void 0;
const mainGlobals_1 = require("../../../Globals/mainGlobals");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Globals_1 = require("../../../Globals");
const file_1 = require("../processors/launcher/file");
function getLauncherMC() {
    return path_1.default.join((0, file_1.getLauncherDir)(), ".minecraft");
}
exports.getLauncherMC = getLauncherMC;
function getVersionsDir() {
    return path_1.default.join((0, file_1.getLauncherDir)(), "versions");
}
exports.getVersionsDir = getVersionsDir;
function getVersionJar(versionName) {
    return path_1.default.join(getVersionsDir(), versionName, `${versionName}.jar`);
}
exports.getVersionJar = getVersionJar;
function getVersionManifest(versionName) {
    return path_1.default.join(getVersionsDir(), versionName, `${versionName}.json`);
}
exports.getVersionManifest = getVersionManifest;
function getLibrariesDir() {
    return path_1.default.join((0, file_1.getLauncherDir)(), "libraries");
}
exports.getLibrariesDir = getLibrariesDir;
/** Modpack temp/create-0.0.1.zip */
function getInstallZip(installDir, id, config) {
    const version = Globals_1.Globals.getLastVersion(config);
    const tempDir = mainGlobals_1.MainGlobals.getTempDir(installDir);
    return path_1.default.join(tempDir, `${id}-${version.id}.zip`);
}
exports.getInstallZip = getInstallZip;
function getForgeInstallProfile(installDir, id, config) {
    const forgeDir = getForgeDir(installDir, id, config);
    return path_1.default.join(forgeDir, "install_profile.json");
}
exports.getForgeInstallProfile = getForgeInstallProfile;
/** temp/create-0.0.1-forge.zip */
function getForgeInstallerZip(installDir, id, config) {
    const version = Globals_1.Globals.getLastVersion(config);
    const tempDir = mainGlobals_1.MainGlobals.getTempDir(installDir);
    return path_1.default.join(tempDir, `${id}-${version.id}.forge.zip`);
}
exports.getForgeInstallerZip = getForgeInstallerZip;
/** temp/create-0.0.1-forge/ */
function getForgeDir(installDir, id, config) {
    const version = Globals_1.Globals.getLastVersion(config);
    const tempDir = mainGlobals_1.MainGlobals.getTempDir(installDir);
    const dir = path_1.default.join(tempDir, `${id}-${version.id}-forge/`);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    return dir;
}
exports.getForgeDir = getForgeDir;
//# sourceMappingURL=mcBase.js.map