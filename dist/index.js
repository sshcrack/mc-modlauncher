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
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
const electron_1 = require("electron");
const InstallManager_1 = require("./backend/InstallManager");
const events_1 = require("./backend/main/events");
const java_1 = require("./backend/main/java");
const main_funcs_1 = require("./backend/main/main_funcs");
const mainLogger_1 = require("./interfaces/mainLogger");
const main_1 = require("./pages/preferences/main");
const logger = mainLogger_1.MainLogger.get("Main");
(0, main_funcs_1.registerUri)();
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    electron_1.app.quit();
}
logger.log("Is packaged", electron_1.app.isPackaged, "Name", electron_1.app.getName(), "Version", electron_1.app.getVersion());
(0, main_funcs_1.addUpdater)();
let mainWindow;
const createWindow = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    (0, main_funcs_1.registerURIOpenEvent)();
    console.log("Preload is", MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY);
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        height: 600,
        width: 800,
        darkTheme: true,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            nodeIntegration: false
        }
    });
    mainWindow.setMenuBarVisibility(false);
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    mainWindow.maximize();
    try {
        (0, java_1.checkJava)();
    }
    catch (e) {
        const msg = (_b = (_a = e.stack) !== null && _a !== void 0 ? _a : e.message) !== null && _b !== void 0 ? _b : e;
        logger.error(msg);
        electron_1.dialog.showMessageBoxSync(mainWindow, {
            message: msg,
            type: "error"
        });
        electron_1.app.quit();
    }
});
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
    if (process.platform === 'darwin')
        return;
    logger.log("Quitting...");
    electron_1.app.quit();
});
electron_1.app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
main_1.Preference.addListeners();
InstallManager_1.InstallManager.initialize();
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
(0, events_1.setupEvents)();
//# sourceMappingURL=index.js.map