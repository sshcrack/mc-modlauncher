"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const pretty_bytes_1 = __importDefault(require("../assets/pretty-bytes"));
document.addEventListener("DOMContentLoaded", () => {
    setMemory();
    setInstall();
    setCacheRemove();
    const btn = document.getElementById("save");
    btn.addEventListener("click", () => saveThings());
});
function setMemory() {
    const slider = document.getElementById("memory-range");
    const curr = document.getElementById("memory");
    const total = electron_1.ipcRenderer.sendSync("get_mem");
    let settingsMem = electron_1.ipcRenderer.sendSync("get_pref", "memory");
    console.log("Memory is", settingsMem, "total", total);
    if (isNaN(settingsMem)) {
        alert("Invalid memory value, defaulting to half");
        settingsMem = total / 2;
        electron_1.ipcRenderer.sendSync("save_pref", "memory", settingsMem);
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
    const currDir = electron_1.ipcRenderer.sendSync("get_pref", "install_dir");
    input.value = currDir;
    btn.addEventListener("click", () => {
        const id = Math.random();
        electron_1.ipcRenderer.send("select_folder", id, currDir),
            electron_1.ipcRenderer.on("select_folder_reply", (e, innerID, folder) => {
                if (innerID !== id || !folder)
                    return;
                input.value = folder;
            });
    });
}
function saveThings() {
    const input = document.querySelector("#installdir");
    const main = document.querySelector("#center");
    const saving = document.querySelector("#saving");
    const exists = electron_1.ipcRenderer.sendSync("exists_folder", input.value);
    if (!exists) {
        alert(`Install Directory does not exist. Not saving.`);
        return;
    }
    const memEl = document.querySelector("#memory-range");
    const mem = memEl.value;
    main.style.display = "none";
    saving.style.display = "";
    electron_1.ipcRenderer.sendSync("save_pref", "install_dir", input.value);
    electron_1.ipcRenderer.sendSync("save_pref", "memory", parseInt(mem));
    electron_1.ipcRenderer.sendSync("close_prefs");
}
function setCacheRemove() {
    const btn = document.querySelector("#cache-clear");
    const wait = document.querySelector("#wait");
    btn.addEventListener("click", () => {
        electron_1.ipcRenderer.once("clear_cache_reply", size => {
            wait.style.display = "none";
            alert(`Cache with a total of ${size} cleared.`);
        });
        wait.style.display = "";
        electron_1.ipcRenderer.send("clear_cache");
    });
}
//# sourceMappingURL=preload.js.map