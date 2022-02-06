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
exports.getButtonDiv = exports.addButtonAction = void 0;
const renderGlobals_1 = require("../Globals/renderGlobals");
const electron_1 = require("electron");
const logger_1 = require("../interfaces/logger");
const modpack_1 = require("./modpack");
const logger = logger_1.Logger.get("Preload", "Buttons");
function addButtonAction(id, btn, installed, config) {
    btn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const newestVersion = renderGlobals_1.RenderGlobals.hasLatest(id, config);
        if (installed && newestVersion)
            return electron_1.ipcRenderer.send("launch_mc", id, config);
        (0, modpack_1.setLock)(true);
        const parent = btn.parentElement;
        parent.childNodes.forEach(e => e.remove());
        const progress = document.createElement("div");
        progress.className = "progress";
        progress.id = `install-progress-${id}`;
        progress.innerHTML = `<div class="progress-bar" style="width: 0%" role="progressbar">0%</div>`;
        parent.appendChild(progress);
        const bar = progress.querySelector(".progress-bar");
        electron_1.ipcRenderer.on("modpack_update", (_, innerId, percentage, status) => {
            if (id !== innerId)
                return;
            const perStr = `${Math.round(percentage * 100)}%`;
            updateStatus(id, status);
            bar.style.width = perStr;
            bar.innerText = perStr;
        });
        electron_1.ipcRenderer.on("modpack_success", (_, innerId) => {
            if (id !== innerId)
                return;
            (0, modpack_1.updateModpacks)(true);
        });
        electron_1.ipcRenderer.on("modpack_error", (e, innerId, error) => {
            var _a, _b;
            if (id !== innerId)
                return;
            updateStatus(id, null);
            const err = (_b = (_a = error === null || error === void 0 ? void 0 : error.stack) !== null && _a !== void 0 ? _a : error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : error;
            logger.error(err);
            alert(`Error installing modpack ${innerId}: ${err}. Please restart to avoid errors.`);
            (0, modpack_1.updateModpacks)(true);
        });
        //overwrite = newestVersion
        electron_1.ipcRenderer.send("install_modpack", id, !newestVersion);
    }));
}
exports.addButtonAction = addButtonAction;
function getButtonDiv(id, installed, config) {
    const newestVersion = renderGlobals_1.RenderGlobals.hasLatest(id, config);
    const txt = installed ? (newestVersion ? "Play" : "Update") : "Install";
    const classBtn = installed && newestVersion ? "btn-open" : "btn-install";
    const div = document.createElement("div");
    div.className = "card-action";
    const actionButton = `<button class="btn btn-primary btn-primary-highlight ${classBtn} card-action-btn" href="#" id="modpack-${id}-action">${txt}</button>`;
    const removeButton = `<button class="btn btn-outline-danger remove-button" id="modpack-${id}-remove">
            <i class="bi bi-trash-fill remove" /> Uninstall </button>`;
    div.innerHTML = `${actionButton} ${installed ? removeButton : ""}`;
    const actionElement = div.querySelector(".card-action-btn");
    const removeElement = div.querySelector(".remove-button");
    addButtonAction(id, actionElement, installed, config);
    removeElement === null || removeElement === void 0 ? void 0 : removeElement.addEventListener("click", () => {
        const res = electron_1.ipcRenderer.sendSync("uninstall_prompt");
        logger.debug("Uninstall prompt", res);
        if (typeof res !== "boolean")
            return alert("Invalid return value from uninstall prompt");
        if (!res)
            return;
        (0, modpack_1.setLock)(true);
        electron_1.ipcRenderer.send("remove_modpack", id);
        electron_1.ipcRenderer.on("remove_modpack_success", () => (0, modpack_1.updateModpacks)(true));
        electron_1.ipcRenderer.on("remove_modpack_error", (_, e) => {
            var _a, _b;
            alert(`Error uninstalling ${(_b = (_a = e.stack) !== null && _a !== void 0 ? _a : e.message) !== null && _b !== void 0 ? _b : e}`);
            (0, modpack_1.updateModpacks)(true);
        });
    });
    return div;
}
exports.getButtonDiv = getButtonDiv;
function updateStatus(id, status) {
    const modpack = document.getElementById(`modpack-${id}`);
    const statusDiv = modpack.querySelector(".card-status");
    const text = modpack.querySelector(".card-status-span");
    if (status === null) {
        text.innerText = "";
        return statusDiv.style.display = "none";
    }
    statusDiv.style.display = "";
    text.innerText = status;
}
//# sourceMappingURL=buttons.js.map