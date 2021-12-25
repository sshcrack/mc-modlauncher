import { AvailablePrefs } from '../pages/preferences/main';
import { ipcRenderer } from 'electron';

export const preferences = {
    open: () => ipcRenderer.sendSync("open_prefs") as void,
    close: () => ipcRenderer.sendSync("close_prefs") as void,
    get: (key: AvailablePrefs) => ipcRenderer.sendSync("get_pref", key),
    set: (key: AvailablePrefs, value: unknown) => ipcRenderer.sendSync("set_pref", key, value)
}