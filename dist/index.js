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
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
const child_process_1 = require("child_process");
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const Globals_1 = require("./Globals");
const InstallManager_1 = require("./InstallManager");
const file_1 = require("./InstallManager/processors/launcher/file");
const file_2 = require("./InstallManager/processors/modpack/file");
const renderer_1 = require("./preferences/renderer");
const instance_1 = require("./preload/instance");
const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
const genUUID = (str) => (0, uuid_1.v5)(str, MY_NAMESPACE);
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('update-electron-app')({
    repo: 'sshcrack/mc-modlauncher',
    updateInterval: '10 minutes'
});
electron_1.autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Application Update',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };
    electron_1.dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0)
            electron_1.autoUpdater.quitAndInstall();
    });
});
electron_1.autoUpdater.on('error', message => {
    console.error('There was a problem updating the application');
    console.error(message);
});
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    electron_1.app.quit();
}
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron-reloader')(module);
}
catch (_) { /**/ }
let mainWindow;
const createWindow = () => {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        height: 600,
        width: 800,
        darkTheme: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false
        }
    });
    mainWindow.setMenuBarVisibility(false);
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
    mainWindow.maximize();
};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
    electron_1.app.on('ready', createWindow);
}
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        console.log("Quitting...");
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
renderer_1.Preference.addListeners();
InstallManager_1.InstallManager.addListeners();
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
electron_1.ipcMain.on("get_installed", e => {
    e.returnValue = (0, instance_1.getInstalled)();
});
electron_1.ipcMain.on("uninstall_prompt", e => {
    const index = electron_1.dialog.showMessageBoxSync(mainWindow, {
        message: "Are you sure you want to uninstall this modpack?",
        buttons: ["Yes", "No"],
        type: "warning"
    });
    e.returnValue = index === 0;
});
electron_1.ipcMain.on("launch_mc", (e, id, _a) => __awaiter(void 0, void 0, void 0, function* () {
    var { name } = _a, config = __rest(_a, ["name"]);
    const gameDir = (0, file_2.getInstanceDestination)(id);
    const lastVersion = Globals_1.Globals.getLastVersion(Object.assign({ name }, config));
    const launcherDir = (0, file_1.getLauncherDir)();
    const profilesPath = path.join(launcherDir, "launcher_profiles.json");
    const profiles = JSON.parse(fs_1.default.readFileSync(profilesPath, "utf-8"));
    const setUUID = genUUID(id);
    const profile = {
        created: new Date().toISOString(),
        gameDir: gameDir,
        icon: "Furnace",
        lastUsed: new Date().toISOString(),
        lastVersionId: lastVersion.forge_version,
        name,
        type: "custom"
    };
    console.log("Using uuid", setUUID);
    profiles.profiles[setUUID] = profile;
    fs_1.default.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));
    (0, child_process_1.spawn)((0, file_1.getLauncherExe)(), ["--workDir", launcherDir]);
    e.reply("launched_mc_success");
}));
electron_1.ipcMain.on("clean_corrupted", e => {
    (0, instance_1.cleanupCorrupted)();
    e.returnValue = true;
});
//# sourceMappingURL=index.js.map