"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const electron_1 = require("electron");
const modpack_1 = require("./modpack");
const cache_1 = require("./cache");
const launcher_1 = require("./launcher");
const folder_1 = require("./folder");
const preferences_1 = require("./preferences");
const electron_log_1 = __importDefault(require("electron-log"));
electron_log_1.default.transports.file.maxSize = 1024 * 1024 * 20;
electron_log_1.default.log("Setting window.log");
window.log = electron_log_1.default;
const uninstallWarning = "Are you sure you want to uninstall this modpack? This will delete all files, settings, options and controls";
const system = {
    memory: () => electron_1.ipcRenderer.sendSync("get_mem"),
    prompt: {
        uninstall: () => electron_1.ipcRenderer.sendSync("confirm_prompt", uninstallWarning),
        error: (str) => electron_1.ipcRenderer.send("open_err_dialog", str)
    }
};
exports.API = {
    modpack: modpack_1.modpack,
    preferences: preferences_1.preferences,
    system,
    cache: cache_1.cache,
    folder: folder_1.folder,
    launcher: launcher_1.launcher,
};
electron_1.contextBridge.exposeInMainWorld("api", exports.API);
electron_1.contextBridge.exposeInMainWorld("log", electron_log_1.default);
//# sourceMappingURL=index.js.map