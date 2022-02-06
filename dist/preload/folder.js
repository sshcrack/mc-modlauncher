"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.folder = void 0;
const electron_1 = require("electron");
exports.folder = {
    open: () => electron_1.ipcRenderer.send("open_folder"),
    select: (dir) => {
        return new Promise(resolve => {
            const id = Math.random();
            electron_1.ipcRenderer.on("select_folder_reply", (e, innerID, folder) => {
                if (innerID !== id)
                    return;
                resolve(folder);
            });
            electron_1.ipcRenderer.send("select_folder", id, dir);
        });
    }
};
//# sourceMappingURL=folder.js.map