"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerURIOpenEvent = exports.registerUri = exports.addUpdater = void 0;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const mainLogger_1 = require("../../interfaces/mainLogger");
const logger = mainLogger_1.MainLogger.get("Main", "Updater");
function addUpdater() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('update-electron-app')({
        repo: 'sshcrack/mc-modlauncher',
        updateInterval: '10 minutes',
        logger: logger
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
        logger.error("Could not check auto-updater:", message);
    });
}
exports.addUpdater = addUpdater;
function registerUri() {
    logger.info("Registering URI sshmods://");
    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            electron_1.app.setAsDefaultProtocolClient('sshmods', process.execPath, [path_1.default.resolve(process.argv[1])]);
        }
    }
    else {
        electron_1.app.setAsDefaultProtocolClient('sshmods');
    }
}
exports.registerUri = registerUri;
function registerURIOpenEvent() {
    electron_1.app.on("open-url", (event, url) => {
        console.log("Open url event", url);
        logger.log("Open url horraaaay", url);
        electron_1.dialog.showErrorBox("Yes", "Opened url " + url);
    });
}
exports.registerURIOpenEvent = registerURIOpenEvent;
//# sourceMappingURL=main_funcs.js.map