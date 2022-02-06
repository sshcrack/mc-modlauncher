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
exports.queueUpdating = exports.handleIndex = void 0;
const electron_1 = require("electron");
const logger_1 = require("../interfaces/logger");
const modpack_1 = require("./modpack");
const logger = logger_1.Logger.get("Preload", "Main");
function handleIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        electron_1.ipcRenderer.sendSync("clean_corrupted");
        yield (0, modpack_1.updateModpacks)();
        yield addPrefEvent();
        queueUpdating();
    });
}
exports.handleIndex = handleIndex;
function queueUpdating() {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => {
            setTimeout(() => resolve(), 60000);
        });
        yield (0, modpack_1.updateModpacks)();
        queueUpdating();
    });
}
exports.queueUpdating = queueUpdating;
function addPrefEvent() {
    return __awaiter(this, void 0, void 0, function* () {
        const prefBtn = document.getElementById("settings");
        prefBtn.addEventListener("click", () => {
            logger.info("Sending opening signal to preferences...");
            electron_1.ipcRenderer.send("open_prefs");
        });
    });
}
//# sourceMappingURL=main.js.map