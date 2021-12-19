import { app, BrowserWindow, dialog, ipcMain } from "electron";
import Store from "electron-store";
import fs from "fs";
import os from "os";
import path from "path";

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
        console.log("Window is", Preference.window);
        if (Preference.window) return;

        console.log("Opening preferences...")
        const installDir = store.get("install_dir")

        console.log("Creating directory at", installDir)
        if (!fs.existsSync(installDir))
            fs.mkdirSync(installDir, { recursive: true })

        const preferences = new BrowserWindow({
            height: 400,
            width: 300,
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
        Preference.window = preferences;

        preferences.on("closed", () => {
            Preference.window = null;
        })
    }

    static addListeners() {
        ipcMain.on("get_pref", (e, key: AvailablePrefs) => {
            e.returnValue = store.get(key)
        });

        ipcMain.on("save_pref", (e, key: AvailablePrefs, val: unknown) => {
            console.log("Saving pref", key, val)

            store.set(key, val)
            e.returnValue = true
        });

        ipcMain.on("open_prefs", e => {
            Preference.open()
                .then(() => e.reply("open_prefs_reply", true))
                .catch(err => {
                    console.log("Error", err)
                    e.reply("open_prefs_reply", false)
                })
        });

        ipcMain.on("get_mem", e => {
            e.returnValue = os.totalmem();
        })

        ipcMain.on("close_prefs", e => {
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

        ipcMain.on("exists_folder", (e, p) => {
            e.returnValue = fs.existsSync(p) && fs.lstatSync(p).isDirectory()
        })
    }
}

export type StoreInterface = typeof store
export type AvailablePrefs = keyof typeof store.store;