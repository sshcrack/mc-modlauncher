"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalled = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getInstalled() {
    console.log("Getting install dir");
    const installDir = electron_1.ipcRenderer.sendSync("get_pref", "install_dir");
    const instances = path_1.default.join(installDir, "Instances");
    console.log("Creating instances folder at", installDir);
    if (!fs_1.default.existsSync(installDir))
        fs_1.default.mkdirSync(installDir, { recursive: true });
    console.log("Listing directories");
    const directories = fs_1.default.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name);
    return directories;
}
exports.getInstalled = getInstalled;
//# sourceMappingURL=instance.js.map