"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launcher = void 0;
const electron_1 = require("electron");
exports.launcher = {
    launch: (id, config) => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise(resolve => {
            electron_1.ipcRenderer.once("launched_mc_success", () => resolve());
            electron_1.ipcRenderer.send("launch_mc");
        });
    })
};
//# sourceMappingURL=launcher.js.map