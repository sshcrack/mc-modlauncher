// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { app, BrowserWindow } from 'electron';
import { InstallManager } from './backend/InstallManager';
import { InstallMover } from './backend/InstallMover';
import LockManager from './backend/LockManager';
import { addJavaListeners } from './backend/LockManager/java';
import { setupEvents } from './backend/main/events';
import { addCrashHandler, addUpdater, handleURIOpen, registerUri, registerURIOpenEvent, setContentSecurity } from './backend/main/main_funcs';
import { addSystemListeners } from './backend/main/system';
import { Preference } from './backend/preferences';
import { MainGlobals } from './Globals/mainGlobals';
import { MainLogger } from './interfaces/mainLogger';

const logger = MainLogger.get("Main")

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_WEBPACK_ENTRY: string

registerUri();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

process.chdir(app.getAppPath())
logger.log("Is packaged", app.isPackaged, "Name", app.getName(),  "Version", app.getVersion(), "ARGv", process.argv, "CWD", process.cwd())

setContentSecurity();
addUpdater();
addCrashHandler();


let mainWindow: BrowserWindow;
const createWindow = async () => {
  registerURIOpenEvent();

  // Create the browser window.
  mainWindow = new BrowserWindow({
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
  mainWindow.maximize()

  mainWindow.on("focus", () => {
    const { window } = Preference;
    if (!window)
      return;

    window.focus();
    window.flashFrame(true)
    mainWindow.blur();
  })

  MainGlobals.window = mainWindow
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_, argv) => {
    const uri = argv.find(e => e.startsWith("sshmods://"))
    if(uri)
      handleURIOpen(uri);
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.on('ready', createWindow);
}

if(process.argv.some(e => e.startsWith("sshmods://"))) {
  handleURIOpen(process.argv.find(e => e.startsWith("sshmods://")))
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform === 'darwin')
    return;

  logger.log("Quitting...")
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

Preference.addListeners();
InstallManager.initialize();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

setupEvents();
addSystemListeners()
addJavaListeners()
LockManager.addLockListeners()
InstallMover.addListeners()