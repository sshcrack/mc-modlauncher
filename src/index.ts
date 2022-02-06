// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();

import { app, BrowserWindow, dialog } from 'electron';
import { InstallManager } from './backend/InstallManager';
import { setupEvents } from './backend/main/events';
import { checkJava } from './backend/main/java';
import { addUpdater, registerUri, registerURIOpenEvent } from './backend/main/main_funcs';
import { MainLogger } from './interfaces/mainLogger';
import { Preference } from './pages/preferences/main';

const logger = MainLogger.get("Main")

declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_WEBPACK_ENTRY: string

registerUri();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

logger.log("Is packaged", app.isPackaged, "Name", app.getName(),  "Version", app.getVersion())

addUpdater();


let mainWindow: BrowserWindow;
const createWindow = async () => {
  registerURIOpenEvent();
  console.log("Preload is", MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)

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

  try {
    checkJava()
  } catch (e) {
    const msg = e.stack ?? e.message ?? e
    logger.error(msg);
    dialog.showMessageBoxSync(mainWindow, {
      message: msg,
      type: "error"
    });
    app.quit();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.on('ready', createWindow);
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