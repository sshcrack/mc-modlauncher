"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstanceDestination = exports.getUrl = void 0;
const Globals_1 = require("../../../../Globals");
const mainGlobals_1 = require("../../../../Globals/mainGlobals");
const baseUrl = Globals_1.Globals.baseUrl;
function getUrl(id, config) {
    const version = Globals_1.Globals.getLastVersion(config);
    return `${baseUrl}/${id}/${version.file}`;
}
exports.getUrl = getUrl;
function getInstanceDestination(id) {
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    return mainGlobals_1.MainGlobals.getInstancePathById(installDir, id);
}
exports.getInstanceDestination = getInstanceDestination;
//# sourceMappingURL=file.js.map