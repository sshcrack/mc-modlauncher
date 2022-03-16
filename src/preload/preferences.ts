import { ipcRenderer } from 'electron';
import { AvailablePrefs } from '../backend/preferences';

export const preferences = {
    open: () => {
        return new Promise<void>(resolve => {
            ipcRenderer.on("prefs_closed", () => resolve())
            ipcRenderer.send("open_prefs")
        });
    },
    close: () => ipcRenderer.sendSync("close_prefs") as void,
    get: (key: AvailablePrefs) => ipcRenderer.sendSync("get_pref", key),
    set: (key: AvailablePrefs, value: unknown) => ipcRenderer.sendSync("set_pref", key, value),
    isOpen: () => ipcRenderer.sendSync("is_open_prefs") as boolean,
    moveInstallDir: (dest: string) => {
        return new Promise<void>((resolve, reject) => {
            ipcRenderer.send("install_move", dest)

            ipcRenderer.on("install_move_success", () => {
                resolve()
            })

            ipcRenderer.on("install_move_error", e => {
                reject(e)
            })
        });
    }
}