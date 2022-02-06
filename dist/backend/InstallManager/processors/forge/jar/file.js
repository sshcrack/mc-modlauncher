"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinecraftClientUrl = void 0;
const fs_1 = __importDefault(require("fs"));
const mcBase_1 = require("../../../General/mcBase");
function getMinecraftClientUrl(mcVersion) {
    const manifestPath = (0, mcBase_1.getVersionManifest)(mcVersion);
    const manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, "utf-8"));
    return manifest.downloads.client.url;
}
exports.getMinecraftClientUrl = getMinecraftClientUrl;
//# sourceMappingURL=file.js.map