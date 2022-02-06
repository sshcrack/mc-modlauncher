"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preferences = void 0;
const electron_1 = require("electron");
exports.preferences = {
    open: () => electron_1.ipcRenderer.sendSync("open_prefs"),
    close: () => electron_1.ipcRenderer.sendSync("close_prefs"),
    get: (key) => electron_1.ipcRenderer.sendSync("get_pref", key),
    set: (key, value) => electron_1.ipcRenderer.sendSync("set_pref", key, value)
};
//# sourceMappingURL=preferences.js.map