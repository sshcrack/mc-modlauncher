// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { spawn } from "child_process";
import { app, autoUpdater, BrowserWindow, dialog, ipcMain } from 'electron';
import fs from "fs";
import * as path from 'path';
import { v5 as uuid } from "uuid";
import { Globals } from './Globals';
import { InstallManager } from './InstallManager';
import { getLauncherDir, getLauncherExe } from './InstallManager/processors/launcher/file';
import { getInstanceDestination } from './InstallManager/processors/modpack/file';
import { LauncherProfiles, Profile } from './interfaces/launcher';
import { Modpack } from './interfaces/modpack';
import { Preference } from './preferences/renderer';
import { cleanupCorrupted, getInstalled } from './preload/instance';
const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

const genUUID = (str: string) => uuid(str, MY_NAMESPACE)

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('update-electron-app')({
  repo: 'sshcrack/mc-modlauncher',
  updateInterval: '10 minutes'
})

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reloader')(module)
} catch (_) { /**/ }


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
    buttons: ["Yes", "No"],
    type: "warning"
  })

  e.returnValue = index === 0;
})

ipcMain.on("launch_mc", async (e, id, { name, ...config}: Modpack) => {
  const gameDir = getInstanceDestination(id)
  const lastVersion = Globals.getLastVersion({ name, ...config})

  const launcherDir = getLauncherDir();
  const profilesPath = path.join(launcherDir, "launcher_profiles.json");

  const profiles: LauncherProfiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"))
  const setUUID = genUUID(id);

  const profile: Profile = {
    created: new Date().toISOString(),
    gameDir: gameDir,
    icon: "Furnace",
    lastUsed: new Date().toISOString(),
    lastVersionId: lastVersion.forge_version,
    name,
    type: "custom"
  }

  console.log("Using uuid", setUUID)
  profiles.profiles[setUUID] = profile;
  fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2))

  spawn(getLauncherExe(), ["--workDir", launcherDir])
  e.reply("launched_mc_success")
})

ipcMain.on("clean_corrupted", e => {
  cleanupCorrupted()
  e.returnValue = true
})