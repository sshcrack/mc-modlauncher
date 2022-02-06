"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modpack = void 0;
const electron_1 = require("electron");
function runAction(id, overwrite, onUpdate) {
    return new Promise((resolve, reject) => {
        addDefaultListener(id, resolve, reject);
        electron_1.ipcRenderer.on("modpack_update", (e, progress) => onUpdate(progress));
        electron_1.ipcRenderer.send("modpack_install", id, overwrite);
    });
}
function removeModpack(id) {
    return new Promise((resolve, reject) => {
        addDefaultListener(id, resolve, reject);
        electron_1.ipcRenderer.send("modpack_remove", id);
    });
}
function cleanCorrupted() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer.on("clean_corrupted_suuccess", () => resolve());
        electron_1.ipcRenderer.on("clean_corrupted_error", (e, err) => reject(err));
        electron_1.ipcRenderer.send("clean_corrupted");
    });
}
function addDefaultListener(id, resolve, reject) {
    electron_1.ipcRenderer.once("modpack_success", (e, innerId) => innerId === id && resolve());
    electron_1.ipcRenderer.once("modpack_error", (e, innerId, err) => id === innerId && reject(err));
}
exports.modpack = {
    version: (id) => electron_1.ipcRenderer.sendSync("get_version", id),
    remove: (id) => removeModpack(id),
    install: (id, onUpdate) => runAction(id, false, onUpdate),
    update: (id, onUpdate) => runAction(id, true, onUpdate),
    list: () => electron_1.ipcRenderer.sendSync("get_installed"),
    clean: () => cleanCorrupted()
};
//# sourceMappingURL=modpack.js.map