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
require("bootstrap");
require("bootstrap-icons/font/bootstrap-icons.css");
require("../theme.scss");
require("./index.scss");
const renderLogger_1 = require("../../interfaces/renderLogger");
const modpack_1 = require("./modpack");
const logger = renderLogger_1.RenderLogger.get("Preload", "Main");
const { modpack, preferences } = window.api;
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    modpack.clean();
    yield (0, modpack_1.updateModpacks)();
    yield addPrefEvent();
    queueUpdating();
});
function queueUpdating() {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => {
            setTimeout(() => resolve(), 60000);
        });
        yield (0, modpack_1.updateModpacks)();
        queueUpdating();
    });
}
function addPrefEvent() {
    return __awaiter(this, void 0, void 0, function* () {
        const prefBtn = document.getElementById("settings");
        prefBtn.addEventListener("click", () => {
            logger.info("Sending opening signal to preferences...");
            preferences.open();
        });
    });
}
//# sourceMappingURL=renderer.js.map