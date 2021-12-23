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
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
const electron_1 = require("electron");
const path = __importStar(require("path"));
const InstallManager_1 = require("./InstallManager");
const logger_1 = require("./interfaces/logger");
const events_1 = require("./main/events");
const updater_1 = require("./main/updater");
const renderer_1 = require("./preferences/renderer");
const logger = logger_1.Logger.get("Main");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    electron_1.app.quit();
}
logger.log("Is packaged", electron_1.app.isPackaged, "Name", electron_1.app.getName(), "Version", electron_1.app.getVersion());
(0, updater_1.addUpdater)();
(0, updater_1.addReloader)();
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
        logger.log("Quitting...");
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
(0, events_1.setupEvents)();
//# sourceMappingURL=index.js.map