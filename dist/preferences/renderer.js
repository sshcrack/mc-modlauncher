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
const appData = electron_1.app.getPath("appData");
const installDir = path_1.default.join(appData, "sshmods");
const prefix = path_1.default.join(__dirname, "../src/preferences/index.html");
const store = new electron_store_1.default({
    defaults: {
        "install_dir": installDir
    }
});
class Preference {
    static open() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Opening preferences...");
            const installDir = store.get("install_dir");
            console.log("Creating directory at", installDir);
            if (!fs_1.default.existsSync(installDir))
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
    static addListeners() {
        electron_1.ipcMain.on("get_pref", (e, key) => {
            e.returnValue = store.get(key);
        });
        electron_1.ipcMain.on("save_pref", (e, key, val) => {
            console.log("Saving pref", key, val);
            store.set(key, val);
            e.returnValue = true;
        });
        electron_1.ipcMain.on("open_prefs", e => {
            Preference.open()
                .then(() => e.reply(true))
                .catch(() => e.reply(false));
        });
    }
}
exports.Preference = Preference;
Preference.opened = false;
//# sourceMappingURL=renderer.js.map