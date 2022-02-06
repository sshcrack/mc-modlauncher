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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pretty_bytes_1 = __importDefault(require("pretty-bytes"));
require("bootstrap");
require("bootstrap-icons/font/bootstrap-icons.css");
require("../theme.css");
require("./index.css");
const renderLogger_1 = require("../../interfaces/renderLogger");
const logger = renderLogger_1.RenderLogger.get("Preferences", "Preload");
const { api } = window;
const { preferences, system, cache, folder } = api;
document.addEventListener("DOMContentLoaded", () => {
    setMemory();
    //setInstall();
    setCacheRemove();
    setOpenFolder();
    const btn = document.getElementById("save");
    btn.addEventListener("click", () => saveThings());
});
function setMemory() {
    const slider = document.getElementById("memory-range");
    const curr = document.getElementById("memory");
    const total = system.memory();
    let settingsMem = preferences.get("memory");
    logger.debug("Memory is", settingsMem, "total", total);
    if (isNaN(settingsMem)) {
        alert("Invalid memory value, defaulting to half");
        settingsMem = total / 2;
        preferences.set("memory", settingsMem);
    }
    const asInt = parseInt(settingsMem);
    setTimeout(() => slider.value = asInt, 200);
    slider.max = total;
    const update = (e) => curr.innerText = (0, pretty_bytes_1.default)(e, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    slider.addEventListener("input", (e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const { value } = e.target;
        update(parseInt(value));
    });
    update(parseInt(settingsMem));
}
function setInstall() {
    const btn = document.querySelector("#browse");
    const input = document.querySelector("#installdir");
    const currDir = preferences.get("install_dir");
    input.value = currDir;
    btn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        input.value = yield folder.select(currDir);
    }));
}
function saveThings() {
    const { set: setPref, close: closePref } = api.preferences;
    const main = document.querySelector("#center");
    const saving = document.querySelector("#wait");
    const memEl = document.querySelector("#memory-range");
    const mem = memEl.value;
    main.style.display = "none";
    saving.style.display = "";
    setPref("memory", parseInt(mem));
    closePref();
}
function setCacheRemove() {
    const btn = document.querySelector("#cache-clear");
    const wait = document.querySelector("#wait");
    btn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        wait.style.display = "";
        const cleared = yield cache.clear();
        wait.style.display = "none";
        alert(`Cache with a total of ${cleared} cleared.`);
    }));
}
function setOpenFolder() {
    const btn = document.querySelector("#open-folder");
    btn.addEventListener("click", () => {
        logger.info("Sending opening signal");
        folder.open();
    });
}
//# sourceMappingURL=renderer.js.map