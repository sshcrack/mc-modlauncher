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
exports.Preference = void 0;
const electron_1 = require("electron");
const electron_store_1 = __importDefault(require("electron-store"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const appdata = electron_1.app.getPath("appData");
const prefix = path_1.default.join(__dirname, "preferences");
const store = new electron_store_1.default({ defaults: {
        "install_dir": path_1.default.join(appdata, "sshmods")
    } });
class Preference {
    static open() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Opening preferences...");
            const installDir = electron_1.ipcRenderer.sendSync("get_pref_reply", "install_dir");
            console.log("Creating directory at", installDir);
            fs_1.default.mkdirSync(installDir, { recursive: true });
            const preferences = new electron_1.BrowserWindow({
                height: 600,
                width: 800,
                darkTheme: true,
                webPreferences: {
                    preload: path_1.default.join(prefix, "preload.js"),
                    contextIsolation: true
                }
            });
            preferences.setMenuBarVisibility(false);
            preferences.setMenu(null);
            preferences.loadFile(path_1.default.join(prefix, "index.html"));
            preferences.show();
            this.opened = true;
            preferences.on("closed", () => this.opened = false);
        });
    }
    static addListeners(ipc) {
        ipc.on("get_pref", (e, key) => {
            console.log("Getting preference", key);
            const toReturn = {
                key,
                value: store.get(key)
            };
            console.log("Replying");
            e.reply("get_pref_reply", toReturn);
        });
        ipc.on("get_pref_sync", (e, key) => {
            e.returnValue = {
                key,
                value: store.get(key)
            };
        });
        ipc.on("save_pref", (e, key, val) => {
            console.log("Saving pref", key, val);
            const toReturn = {
                key,
                value: store.get(key)
            };
            e.reply("saved_pref", toReturn);
        });
        ipc.on("open_prefs", e => {
            Preference.open()
                .then(() => e.reply("prefs_opened"));
        });
    }
}
exports.Preference = Preference;
Preference.opened = false;
//# sourceMappingURL=index.js.map