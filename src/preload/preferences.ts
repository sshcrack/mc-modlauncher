import { AvailablePrefs } from '../backend/preferences';
import { ipcRenderer } from 'electron';

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
    isOpen: () => ipcRenderer.sendSync("is_open_prefs") as boolean
}