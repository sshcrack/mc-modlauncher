"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForgeUrl = void 0;
const Globals_1 = require("../../../../Globals");
const baseUrl = Globals_1.Globals.baseUrl;
function getForgeUrl(id, config) {
    const version = Globals_1.Globals.getLastVersion(config);
    return `${baseUrl}/${id}/${version.forge}`;
}
exports.getForgeUrl = getForgeUrl;
//# sourceMappingURL=file.js.map