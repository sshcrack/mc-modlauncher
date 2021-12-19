import { BrowserWindow, ipcMain, app } from "electron";
import Store from "electron-store";
import fs from "fs";
import path from "path";

const appData = app.getPath("appData");
const installDir = path.join(appData, "sshmods")

const prefix = path.join(__dirname, "../src/preferences/index.html");
const store = new Store({
    defaults: {
        "install_dir": installDir
    }
})

export class Preference {
    static opened = false;

    static async open() {
        console.log("Opening preferences...")
        const installDir = store.get("install_dir")

        console.log("Creating directory at", installDir)
        if(!fs.existsSync(installDir))
            fs.mkdirSync(installDir, { recursive: true })

        const preferences = new BrowserWindow({
            height: 600,
            width: 800,
            darkTheme: true,
            webPreferences: {
                preload: path.join(prefix, "preload.js"),
                contextIsolation: true
            }
        });

        preferences.setMenuBarVisibility(false);
        preferences.setMenu(null);
        preferences.loadFile(path.join(prefix, "index.html"));

        preferences.show();
        this.opened = true;

        preferences.on("closed", () => this.opened = false)
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
                .then(() => e.reply(true))
                .catch(() => e.reply(false))
        });
    }
}

export type StoreInterface = typeof store
export type AvailablePrefs = keyof typeof store.store;