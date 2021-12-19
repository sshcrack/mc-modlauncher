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
exports.handleIndex = void 0;
const electron_1 = require("electron");
const instance_1 = require("./instance");
const path_1 = __importDefault(require("path"));
const base = "https://mc.sshbot.ddnss.de";
const listUrl = `${base}/list.json`;
function handleIndex() {
    return __awaiter(this, void 0, void 0, function* () {
        yield processModpacks();
        yield addPrefAction();
    });
}
exports.handleIndex = handleIndex;
function addPrefAction() {
    return __awaiter(this, void 0, void 0, function* () {
        const prefBtn = document.getElementById("settings");
        prefBtn.addEventListener("click", () => {
            console.log("Sending opening signal...");
            electron_1.ipcRenderer.send("open_prefs");
        });
    });
}
function processModpacks() {
    return __awaiter(this, void 0, void 0, function* () {
        const modpacks = document.getElementById("modpacks");
        const list = yield fetch(listUrl).then(e => e.json()).catch(() => alert("Could not list modpacks"));
        const infos = yield Promise.all(list.map(id => fetch(`${base}/${id}/config.json`).then((e) => __awaiter(this, void 0, void 0, function* () {
            const json = yield e.json();
            return Object.assign({ id: id }, json);
        }))));
        const installed = yield (0, instance_1.getInstalled)();
        const childrenProms = infos.map(({ name, cover, author, description, id }) => __awaiter(this, void 0, void 0, function* () {
            const cardDiv = document.createElement("div");
            const imgUrl = `${base}/${id}/${cover}`;
            const isInstalled = installed.some(e => path_1.default.basename(e) === id);
            const boolToStr = isInstalled ? "1" : "0";
            cardDiv.setAttribute("data-id", id);
            cardDiv.setAttribute("data-installed", boolToStr);
            cardDiv.className = "card modpack";
            cardDiv.innerHTML = `
            <img src="${imgUrl}" class="card-img-top" alt="Modpack cover">
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">by ${author}</h6>
                <p class="card-text">${description}</p>
                <div class="card-bottom card-center">
                    ${getButton(isInstalled, id).outerHTML}
                </div>
            </div>
        `;
            return cardDiv;
        }));
        const children = yield Promise.all(childrenProms);
        const sorted = children.sort((a, b) => {
            const firstInstalled = a.getAttribute("data-installed") === "1";
            const secondInstalled = b.getAttribute("data-installed") === "1";
            const toNumber = (e) => e ? 1 : 0;
            const fNumb = toNumber(firstInstalled);
            const sNumb = toNumber(secondInstalled);
            return fNumb - sNumb;
        });
        modpacks.append(...sorted);
        addButtonEvents();
    });
}
function addButtonEvents() {
    const allModpacks = document.querySelectorAll(".modpack");
    allModpacks.forEach(e => {
        const id = e.getAttribute("data-id");
        const strInstalled = e.getAttribute("data-installed");
        if (!id || !strInstalled) {
            e.remove();
            return;
        }
        const installed = strInstalled === "1";
        const btn = document.getElementById(`modpack-${id}-action`);
        btn.addEventListener("click", () => {
            console.log("Clicked installed", installed, "id", id);
            const parent = btn.parentElement;
            if (!installed) {
                electron_1.ipcRenderer.send("install_modpack", id);
                btn.remove();
                const progress = document.createElement("div");
                progress.className = "progress";
                progress.id = `install-progress-${id}`;
                progress.innerHTML = `<div class="progress-bar" style="width: 0%" role="progressbar">0%</div>`;
                parent.appendChild(progress);
                const bar = progress.querySelector(".progress-bar");
                electron_1.ipcRenderer.on("install_modpack_update", (e, innerId, percentage) => {
                    if (id !== innerId)
                        return;
                    const perStr = `${percentage * 100}%`;
                    bar.style.width = perStr;
                    bar.innerText = `${percentage * 100}%`;
                    if (percentage !== 1)
                        return;
                    progress.remove();
                    const btn = getButton(true, id);
                    parent.appendChild(btn);
                });
            }
        });
    });
}
function getButton(installed, id) {
    const txt = installed ? "Play" : "Install";
    const classBtn = installed ? "btn-open" : "btn-install";
    const a = document.createElement("a");
    a.href = "#";
    a.className = `btn btn-primary card-action ${classBtn}`;
    a.id = `modpack-${id}-action`;
    a.innerText = txt;
    return a;
}
//# sourceMappingURL=index.js.map