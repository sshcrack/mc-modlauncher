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
exports.setLock = exports.updateModpacks = void 0;
const renderLogger_1 = require("../../interfaces/renderLogger");
const Globals_1 = require("../../Globals");
const buttons_1 = require("./scripts/buttons");
const { baseUrl } = Globals_1.Globals;
const listUrl = `${baseUrl}/list.json`;
let locked = false;
const { modpack } = window.api;
const log = renderLogger_1.RenderLogger.get("Dashboard", "Modpack");
function updateModpacks(releaseLock) {
    return __awaiter(this, void 0, void 0, function* () {
        if (releaseLock)
            setLock(false);
        if (locked)
            return;
        setLock(true);
        const modpacks = document.getElementById("modpacks");
        const list = yield fetch(listUrl).then(e => e.json()).catch(e => log.error("Could not fetch list", e));
        if (!list) {
            setLock(false);
            setTimeout(() => {
                updateModpacks();
            }, 2000);
            return;
        }
        const infos = yield Promise.all(list.map(id => fetch(`${baseUrl}/${id}/config.json`, { headers: {
                "pragma": "no-cache",
                "cache-control": "no-cache"
            } }).then((e) => __awaiter(this, void 0, void 0, function* () {
            const json = yield e.json();
            return Object.assign({ id: id }, json);
        }))));
        const installed = modpack.list();
        const childrenProms = infos.map((config) => __awaiter(this, void 0, void 0, function* () {
            const { name, cover, author, description, id } = config;
            const cardDiv = document.createElement("div");
            const imgUrl = `${baseUrl}/${id}/${cover}`;
            const isInstalled = installed.some(e => e.split("\\").pop().split("/").pop() === id);
            const boolToStr = isInstalled ? "1" : "0";
            cardDiv.setAttribute("data-id", id);
            cardDiv.id = "modpack-" + id;
            cardDiv.setAttribute("data-installed", boolToStr);
            cardDiv.className = "card modpack";
            cardDiv.innerHTML = `
            <div class="card-status" style="display:none;">
                <div>
                    <span class="card-status-span"></span>
                </div>
            </div>
            <div class="card-main">
                <img src="${imgUrl}" class="card-img-top" alt="Modpack cover">
                <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">by ${author}</h6>
                    <p class="card-text">${description}</p>
                    <div class="card-bottom card-center">
                    </div>
                </div>
            </div>
        `;
            const buttonDiv = (0, buttons_1.getButtonDiv)(id, isInstalled, config);
            cardDiv.querySelector(".card-main .card-body .card-bottom").append(buttonDiv);
            return cardDiv;
        }));
        const children = yield Promise.all(childrenProms);
        const sorted = children.sort((a, b) => {
            const firstInstalled = a.getAttribute("data-installed") === "1";
            const secondInstalled = b.getAttribute("data-installed") === "1";
            const toNumber = (e) => e ? 1 : 0;
            const fNumb = toNumber(firstInstalled);
            const sNumb = toNumber(secondInstalled);
            return sNumb - fNumb;
        });
        modpacks.innerHTML = "";
        modpacks.append(...sorted);
        setLock(false);
    });
}
exports.updateModpacks = updateModpacks;
function setLock(lock) {
    locked = lock;
}
exports.setLock = setLock;
//# sourceMappingURL=modpack.js.map