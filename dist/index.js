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
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
const electron_1 = require("electron");
const child_process_1 = require("child_process");
const fs_1 = __importStar(require("fs"));
const path = __importStar(require("path"));
const Globals_1 = require("./Globals");
const mainGlobals_1 = require("./Globals/mainGlobals");
const InstallManager_1 = require("./InstallManager");
const file_1 = require("./InstallManager/processors/launcher/file");
const renderer_1 = require("./preferences/renderer");
const instance_1 = require("./preload/instance");
const uuid_1 = require("uuid");
const file_2 = require("./InstallManager/processors/modpack/file");
const interface_1 = require("./InstallManager/processors/interface");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    electron_1.app.quit();
}
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('electron-reloader')(module);
}
catch (_) { /**/ }
const installDir = mainGlobals_1.MainGlobals.getInstallDir();
const tempDir = Globals_1.Globals.getTempDir(installDir);
if ((0, fs_1.existsSync)(tempDir))
    (0, fs_1.rmSync)(tempDir, { recursive: true, force: true });
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
electron_1.app.on('ready', createWindow);
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
electron_1.ipcMain.on("launch_mc", (e, id, { name }) => __awaiter(void 0, void 0, void 0, function* () {
    const gameDir = (0, file_2.getInstanceDestination)(id);
    const launcherDir = (0, file_1.getLauncherDir)();
    const dotLauncher = path.join(launcherDir, `.minecraft`);
    const profilesPath = path.join(dotLauncher, "launcher_profiles.json");
    const profiles = JSON.parse(fs_1.default.readFileSync(profilesPath, "utf-8"));
    const randomUUid = (0, uuid_1.v4)();
    const profile = {
        created: new Date().toISOString(),
        gameDir: gameDir,
        icon: "Furnace",
        lastUsed: new Date().toISOString(),
        lastVersionId: (0, interface_1.getForgeVer)(id),
        name,
        type: "custom"
    };
    delete profiles.profiles;
    profiles.profiles = {};
    profiles.profiles[randomUUid] = profile;
    const launcherExe = path.join(launcherDir, "MinecraftLauncher.exe");
    (0, child_process_1.spawnSync)(launcherExe, ["--workDir", launcherDir]);
    e.reply("launched_mc_success");
}));
//# sourceMappingURL=index.js.map