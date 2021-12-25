/*
window.onload = async () => {
    const doc = document.getElementById("page-index");
    console.log("Dirname", __dirname)
    const { handleIndex } = await import("./preload/main")
    if (doc)
        return await handleIndex();
}*/

import { contextBridge, ipcRenderer } from 'electron';
import { modpack } from './modpack';
import { cache } from './cache';
import { launcher } from './launcher';
import { folder } from './folder';
import { preferences } from './preferences';



const uninstallWarning = "Are you sure you want to uninstall this modpack? This will delete all files, settings, options and controls";

const system = {
    memory: () => ipcRenderer.sendSync("get_mem") as number,
    prompt: {
        uninstall: () => ipcRenderer.sendSync("confirm_prompt", uninstallWarning) as boolean,
        error: (str: string) => ipcRenderer.send("open_err_dialog", str)
    }
}



export const API = {
    modpack,
    preferences,
    system,
    cache,
    folder,
    launcher
}

contextBridge.exposeInMainWorld(
    "api",
    API
)

