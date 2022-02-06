"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const electron_1 = require("electron");
exports.cache = {
    clear: () => {
        return new Promise(resolve => {
            electron_1.ipcRenderer.once("clear_cache_reply", (_, size) => {
                resolve(size);
            });
            electron_1.ipcRenderer.send("clear_cache");
        });
    },
};
//# sourceMappingURL=cache.js.map