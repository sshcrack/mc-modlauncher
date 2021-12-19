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
            const txt = isInstalled ? "Play" : "Install";
            const classBtn = isInstalled ? "btn-open" : "btn-install";
            const boolToStr = isInstalled ? "0" : "1";
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
                    <a href="#" class="btn btn-primary disabled card-action ${classBtn}">${txt}</a>
                </div>
            </div>
        `;
            return cardDiv;
        }));
        const children = yield Promise.all(childrenProms);
        modpacks.append(...children);
    });
}
//# sourceMappingURL=index.js.map