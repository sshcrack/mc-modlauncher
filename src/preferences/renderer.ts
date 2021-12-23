import { app, BrowserWindow, dialog, ipcMain } from "electron";
import Store from "electron-store";
import fs from "fs";
import os from "os";
import path from "path";
import prettyBytes from '../assets/pretty-bytes';
import { Globals } from '../Globals';
import { MainGlobals } from '../Globals/mainGlobals';
import { Logger } from '../interfaces/logger';
import { dirSize } from '../main/folder';

const logger = Logger.get("Preference", "Renderer")
const appData = app.getPath("appData");
const installDir = path.join(appData, "sshmods")

const total = os.totalmem();
export const store = new Store({
    defaults: {
        "install_dir": installDir,
        "memory": total / 2
    }
})

export class Preference {
    static window: BrowserWindow | undefined;

    static async open() {
        if (Preference.window) return;
        const installDir = MainGlobals.getInstallDir()

        logger.info("Opening Preferences")
        if (!fs.existsSync(installDir))
            fs.mkdirSync(installDir, { recursive: true })

        const preferences = new BrowserWindow({
            height: 600,
            width: 350,
            darkTheme: true,
            maximizable: false,
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                contextIsolation: true,
                devTools: true
            }
        });

        preferences.setMenuBarVisibility(false);
        preferences.setMenu(null);
        preferences.loadFile(path.join(__dirname, "../../src/preferences", "index.html"));

        preferences.show();
        preferences.maximize()
        preferences.webContents.openDevTools()
        Preference.window = preferences;

        preferences.on("closed", () => { Preference.window = null })
        this.window = preferences
    }

    static addListeners() {
        ipcMain.on("get_pref", (e, key: AvailablePrefs) => e.returnValue = store.get(key));
        ipcMain.on("get_mem", e => e.returnValue = os.totalmem())
        ipcMain.on("exists_folder", (e, p) => e.returnValue = fs.existsSync(p) && fs.lstatSync(p).isDirectory())

        ipcMain.on("save_pref", async (e, key: AvailablePrefs, val: unknown) => {
            logger.log("Saving preference", key, "with value", val)

            if(key === "install_dir")
                await fs.promises.rename(store.get("install_dir"), val as string)

            store.set(key, val)
            e.reply("saved_prefs")
        });

        ipcMain.on("open_prefs", e =>
            Preference.open()
                .then(() => e.reply("open_prefs_reply", true))
                .catch(err => {
                    logger.error("Failed to open preferences", err)
                    e.reply("open_prefs_reply", false)
                })
        );


        ipcMain.on("close_prefs", e => {
            logger.log("Closing preference has window", !!this.window);
            this.window?.close()
            e.returnValue = !!this.window;
        })

        ipcMain.on("select_folder", async (e, id, dir) => {
            if (!this.window)
                return;

            const res = await dialog.showOpenDialog(this.window, {
                properties: ["openDirectory"],
                title: "Select Install directory",
                defaultPath: dir
            })

            if (res.canceled || !res.filePaths || res.filePaths.length === 0)
                return e.reply("select_folder_reply", id, undefined)

            e.reply("select_folder_reply", id, res.filePaths[0]);
        });


        ipcMain.on("clear_cache", async e => {
            const installDir = MainGlobals.getInstallDir()
            const tempDir = Globals.getTempDir(installDir);
            const exists = fs.existsSync(tempDir);

            if (!exists)
                return e.reply("clear_cache_reply", 0)

            const stat = await dirSize(tempDir);
            const humanReadable = prettyBytes(stat)

            fs.rmSync(tempDir, { recursive: true, force: true })

            e.reply("clear_cache_reply", humanReadable)
        })
    }
}

export type StoreInterface = typeof store
export type AvailablePrefs = keyof typeof store.store;