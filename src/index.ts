// eslint-disable-next-line @typescript-eslint/no-var-requires
require('source-map-support').install();
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { spawnSync } from "child_process";
import fs, { existsSync, rmSync } from "fs";
import * as path from 'path';
import { Globals } from './Globals';
import { MainGlobals } from './Globals/mainGlobals';
import { InstallManager } from './InstallManager';
import { getLauncherDir } from './InstallManager/processors/launcher/file';
import { LauncherProfiles, Profile } from './interfaces/launcher';
import { Preference } from './preferences/renderer';
import { getInstalled } from './preload/instance';
import { v4 as uuid } from "uuid"
import { Modpack } from './interfaces/modpack';
import { getInstanceDestination } from './InstallManager/processors/modpack/file';
import { getForgeVer } from './InstallManager/processors/interface';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reloader')(module)
} catch (_) { /**/ }


const installDir = MainGlobals.getInstallDir();
const tempDir = Globals.getTempDir(installDir)

if (existsSync(tempDir))
  rmSync(tempDir, { recursive: true, force: true })


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
    buttons: ["Yes", "No"],
    type: "warning"
  })

  e.returnValue = index === 0;
})

ipcMain.on("launch_mc", async (e, id, { name }: Modpack) => {
  const gameDir = getInstanceDestination(id)

  const launcherDir = getLauncherDir();
  const dotLauncher = path.join(launcherDir, `.minecraft`)
  const profilesPath = path.join(dotLauncher, "launcher_profiles.json");

  const profiles: LauncherProfiles = JSON.parse(fs.readFileSync(profilesPath, "utf-8"))
  const randomUUid = uuid();

  const profile: Profile = {
    created: new Date().toISOString(),
    gameDir: gameDir,
    icon: "Furnace",
    lastUsed: new Date().toISOString(),
    lastVersionId: getForgeVer(id),
    name,
    type: "custom"
  }

  delete profiles.profiles;
  profiles.profiles = {}
  profiles.profiles[randomUUid] = profile;

  const launcherExe = path.join(launcherDir, "MinecraftLauncher.exe")

  spawnSync(launcherExe, ["--workDir", launcherDir])
  e.reply("launched_mc_success")
})