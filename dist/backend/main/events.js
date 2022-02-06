"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupEvents = void 0;
const child_process_1 = require("child_process");
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const Globals_1 = require("../../Globals");
const mainGlobals_1 = require("../../Globals/mainGlobals");
const mainLogger_1 = require("../../interfaces/mainLogger");
const main_1 = require("../../pages/preferences/main");
const file_1 = require("../InstallManager/processors/launcher/file");
const file_2 = require("../InstallManager/processors/modpack/file");
const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
const genUUID = (str) => (0, uuid_1.v5)(str, MY_NAMESPACE);
const logger = mainLogger_1.MainLogger.get("Events");
function setupEvents() {
    electron_1.ipcMain.on("confirm_prompt", (e, str) => {
        const window = electron_1.BrowserWindow.getFocusedWindow();
        const index = electron_1.dialog.showMessageBoxSync(window, {
            message: str,
            buttons: ["Yes", "No"],
            type: "warning"
        });
        e.returnValue = index === 0;
    });
    electron_1.ipcMain.on("launch_mc", (e, id, _a) => __awaiter(this, void 0, void 0, function* () {
        var { name } = _a, config = __rest(_a, ["name"]);
        const launcherDir = (0, file_1.getLauncherDir)();
        const gameDir = (0, file_2.getInstanceDestination)(id);
        const lastVersion = Globals_1.Globals.getLastVersion(Object.assign({ name }, config));
        const profilesPath = path.join(launcherDir, "launcher_profiles.json");
        const profiles = JSON.parse(fs_1.default.readFileSync(profilesPath, "utf-8"));
        const setUUID = genUUID(id);
        const mem = main_1.store.get("memory");
        const memOption = `-Xmx${mem !== null && mem !== void 0 ? mem : "2G"}`;
        const defaultOptions = `${memOption} -XX:+UnlockExperimentalVMOptions -XX:+UseG1GC -XX:G1NewSizePercent=20 -XX:G1ReservePercent=20 -XX:MaxGCPauseMillis=50 -XX:G1HeapRegionSize=32M`;
        logger.debug("Launching with options", defaultOptions);
        const profile = {
            created: new Date().toISOString(),
            gameDir: gameDir,
            javaArgs: defaultOptions,
            icon: "Furnace",
            lastUsed: new Date().toISOString(),
            lastVersionId: lastVersion.forge_version,
            name,
            type: "custom"
        };
        profiles.profiles[setUUID] = profile;
        logger.debug("Trying to launch mc in dir", gameDir, "with version", lastVersion, "and launcher dir", launcherDir);
        logger.silly("Launcher profiles", profiles);
        fs_1.default.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));
        (0, child_process_1.spawn)((0, file_1.getLauncherExe)(), ["--workDir", launcherDir]);
        e.reply("launched_mc_success");
    }));
    electron_1.ipcMain.on("open_folder", (e) => __awaiter(this, void 0, void 0, function* () {
        const installDir = mainGlobals_1.MainGlobals.getInstallDir();
        logger.debug("Opening install dir", installDir);
        yield electron_1.shell.openPath(installDir);
        e.reply("open_folder_success");
    }));
}
exports.setupEvents = setupEvents;
//# sourceMappingURL=events.js.map