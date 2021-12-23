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
exports.Preference = exports.store = void 0;
const pretty_bytes_1 = __importDefault(require("../assets/pretty-bytes"));
const Globals_1 = require("../Globals");
const electron_1 = require("electron");
const electron_store_1 = __importDefault(require("electron-store"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const mainGlobals_1 = require("../Globals/mainGlobals");
const logger_1 = require("../interfaces/logger");
const logger = logger_1.Logger.get("Preference", "Renderer");
const appData = electron_1.app.getPath("appData");
const installDir = path_1.default.join(appData, "sshmods");
const total = os_1.default.totalmem();
exports.store = new electron_store_1.default({
    defaults: {
        "install_dir": installDir,
        "memory": total / 2
    }
});
class Preference {
    static open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (Preference.window)
                return;
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            logger.await("Opening Preferences");
            if (!fs_1.default.existsSync(installDir))
                fs_1.default.mkdirSync(installDir, { recursive: true });
            const preferences = new electron_1.BrowserWindow({
                height: 400,
                width: 300,
                darkTheme: true,
                maximizable: false,
                webPreferences: {
                    preload: path_1.default.join(__dirname, "preload.js"),
                    contextIsolation: true,
                    devTools: true
                }
            });
            preferences.setMenuBarVisibility(false);
            preferences.setMenu(null);
            preferences.loadFile(path_1.default.join(__dirname, "../../src/preferences", "index.html"));
            preferences.show();
            Preference.window = preferences;
            preferences.on("closed", () => { Preference.window = null; });
        });
    }
    static addListeners() {
        electron_1.ipcMain.on("get_pref", (e, key) => e.returnValue = exports.store.get(key));
        electron_1.ipcMain.on("get_mem", e => e.returnValue = os_1.default.totalmem());
        electron_1.ipcMain.on("exists_folder", (e, p) => e.returnValue = fs_1.default.existsSync(p) && fs_1.default.lstatSync(p).isDirectory());
        electron_1.ipcMain.on("save_pref", (e, key, val) => __awaiter(this, void 0, void 0, function* () {
            logger.log("Saving preference", key, "with value", val);
            if (key === "install_dir")
                yield fs_1.default.promises.rename(exports.store.get("install_dir"), val);
            exports.store.set(key, val);
            e.reply("saved_prefs");
        }));
        electron_1.ipcMain.on("open_prefs", e => Preference.open()
            .then(() => e.reply("open_prefs_reply", true))
            .catch(err => {
            logger.error("Failed to open preferences", err);
            e.reply("open_prefs_reply", false);
        }));
        electron_1.ipcMain.on("close_prefs", e => {
            var _a;
            (_a = this.window) === null || _a === void 0 ? void 0 : _a.close();
            e.returnValue = !!this.window;
        });
        electron_1.ipcMain.on("select_folder", (e, id, dir) => __awaiter(this, void 0, void 0, function* () {
            if (!this.window)
                return;
            const res = yield electron_1.dialog.showOpenDialog(this.window, {
                properties: ["openDirectory"],
                title: "Select Install directory",
                defaultPath: dir
            });
            if (res.canceled || !res.filePaths || res.filePaths.length === 0)
                return e.reply("select_folder_reply", id, undefined);
            e.reply("select_folder_reply", id, res.filePaths[0]);
        }));
        electron_1.ipcMain.on("clear_cache", e => {
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            const tempDir = Globals_1.Globals.getTempDir(installDir);
            const exists = fs_1.default.existsSync(tempDir);
            if (!exists)
                return e.reply("clear_cache_reply", 0);
            const stat = fs_1.default.statSync(tempDir);
            fs_1.default.rmSync(tempDir, { recursive: true, force: true });
            const humanReadable = (0, pretty_bytes_1.default)(stat.size);
            e.reply("clear_cache_reply", humanReadable);
        });
    }
}
exports.Preference = Preference;
//# sourceMappingURL=renderer.js.map