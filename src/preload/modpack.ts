import { ipcRenderer } from 'electron';
import { Version } from '../interfaces/modpack';
import { onUpdate } from './interface';

function runAction(id: string, overwrite: boolean, onUpdate: onUpdate) {
    return new Promise<void>((resolve, reject) => {
        addDefaultListener(id, () => resolve(), () => reject())

        ipcRenderer.on("modpack_update", (_, innerId, progress) => innerId === id && onUpdate(progress))
        ipcRenderer.send("install_modpack", id, overwrite)
    });
}

function removeModpack(id: string) {
    return new Promise<void>((resolve, reject) => {
        addDefaultListener(id, () => resolve(), () => reject())

        ipcRenderer.send("modpack_remove", id)
    });
}

function cleanCorrupted() {
    return new Promise<void>((resolve, reject) => {
        ipcRenderer.on("clean_corrupted_suuccess", () => resolve())
        ipcRenderer.on("clean_corrupted_error", (e, err) => reject(err))

        ipcRenderer.send("clean_corrupted")
    });
}

function addDefaultListener<T>(id: string, resolve: () => void, reject: (err: T) => void) {
    console.log("Default Listener has registered events for", id)
    ipcRenderer.on("modpack_success", (e, innerId) => innerId === id && resolve())

    ipcRenderer.on("modpack_error", (e, innerId, err) => innerId === id && reject(err))
}

export const modpack = {
    version: (id: string) => ipcRenderer.sendSync("get_version", id) as Version,
    remove: (id: string) => removeModpack(id),
    install: (id: string, onUpdate: onUpdate) => runAction(id, false, onUpdate),
    update: (id: string, onUpdate: onUpdate) => runAction(id, true, onUpdate),
    list: () => ipcRenderer.sendSync("get_installed") as string[],
    clean: () => cleanCorrupted()
}