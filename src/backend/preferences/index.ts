import { app, BrowserWindow, dialog, ipcMain, IpcMainEvent } from "electron";
import Store from "electron-store";
import fs from "fs";
import os from "os";
import path from "path";
import prettyBytes from 'pretty-bytes';
import { MainGlobals } from '../../Globals/mainGlobals';
import { MainLogger } from '../../interfaces/mainLogger';
import { dirSize } from '../main/folder';


declare const PREFERENCES_PRELOAD_WEBPACK_ENTRY: string
declare const PREFERENCES_WEBPACK_ENTRY: string

const logger = MainLogger.get("Preference", "Renderer")
const appData = app.getPath("appData");
const installDir = path.join(appData, "sshmods")

const total = os.totalmem();
export const store = new Store({
    defaults: {
        "install_dir": installDir,
        "memory": total / 2,
        "custom_modpacks": [],
        "custom_java": "java"
    }
})

export class Preference {
    static window: BrowserWindow | undefined;

    static async open(event?: IpcMainEvent) {
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
                preload: PREFERENCES_PRELOAD_WEBPACK_ENTRY,
                contextIsolation: true,
                devTools: true
            }
        });

        preferences.setMenuBarVisibility(false);
        preferences.setMenu(null);
        preferences.loadURL(PREFERENCES_WEBPACK_ENTRY);

        preferences.show();
        Preference.window = preferences;

        preferences.on("closed", () => { Preference.window = null; event?.reply("prefs_closed") })
        this.window = preferences
    }

    static addListeners() {
        ipcMain.on("get_pref", (e, key: AvailablePrefs) => e.returnValue = store.get(key));
        ipcMain.on("set_pref", async (e, key: AvailablePrefs, val: unknown) => {
            logger.log("Saving preference", key, "with value", val)

            if (key === "install_dir") {
                console.log("Moving installdir around")
                //await fs.promises.rename(store.get("install_dir"), val as string)
            }

            store.set(key, val)
            e.returnValue = true
        });

        ipcMain.on("open_prefs", e =>
            Preference.open(e)
                .then(() => e.reply("open_prefs_reply", true))
                .catch(err => {
                    logger.error("Failed to open preferences", err)
                    e.reply("open_prefs_reply", false)
                })
        );

        ipcMain.on("is_open_prefs", e => e.returnValue = !!this.window)


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
            const tempDir = MainGlobals.getTempDir(installDir);
            const exists = fs.existsSync(tempDir);

            if (!exists)
                return e.reply("clear_cache_reply", 0)

            const stat = await dirSize(tempDir);
            const humanReadable = prettyBytes(stat)

            fs.rmSync(tempDir, { recursive: true, force: true })

            e.reply("clear_cache_reply", humanReadable)
        })

        ipcMain.on("size_cache", async e => {
            const installDir = MainGlobals.getInstallDir()
            const tempDir = MainGlobals.getTempDir(installDir);
            const exists = fs.existsSync(tempDir);
            logger.log("Getting cache size of", tempDir,"...")

            if (!exists)
                return e.reply("size_cache_reply", 0)

            const stat = await dirSize(tempDir);
            e.reply("size_cache_reply", stat)
        })
    }
}

export type StoreInterface = typeof store
export type AvailablePrefs = keyof typeof store.store;