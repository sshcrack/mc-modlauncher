// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as path from 'path';
import { InstallManager } from './InstallManager';
import { getInstalled } from './preload/instance';
import { Preference } from './preferences/renderer';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reloader')(module)
} catch (_) { /**/}

let mainWindow: BrowserWindow;
const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
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
  mainWindow.maximize()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log("Quitting...")
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

Preference.addListeners();
InstallManager.addListeners();

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


ipcMain.on("get_installed", e => {
  e.returnValue = getInstalled();
})

ipcMain.on("uninstall_prompt", e => {
  const index = dialog.showMessageBoxSync(mainWindow, {
    message: "Are you sure you want to uninstall this modpack?",
    buttons: [ "Yes", "No"],
    type: "warning"
  })

  e.returnValue = index === 0;
})