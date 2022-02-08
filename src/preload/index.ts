import { contextBridge, ipcRenderer } from 'electron';
import { modpack } from './modpack';
import { cache } from './cache';
import { launcher } from './launcher';
import { folder } from './folder';
import { preferences } from './preferences';
import log from "electron-log"
import { v4 } from "uuid"
import { DiskSpace } from 'check-disk-space';

log.transports.file.maxSize = 1024 * 1024 * 20
window.log = log;

// eslint-disable-next-line @typescript-eslint/no-var-requires
log.log("UUid", v4())

const uninstallWarning = "Are you sure you want to uninstall this modpack? This will delete all files, settings, options and controls";

const system = {
    memory: () => {
        return new Promise<number>(resolve => {
            ipcRenderer.on("get_mem_reply", (_, mem) => resolve(mem))
            ipcRenderer.send("get_mem")
        });
    },
    disk: {
        size: (diskPath: string) => {
            return new Promise<DiskSpace | undefined>(resolve => {
                ipcRenderer.on("system_disk_size_reply", (_, innerDiskPath, size) => {
                    if (innerDiskPath !== diskPath)
                        return

                    resolve(size)
                })

                ipcRenderer.send("system_disk_size", diskPath)
            });
        }
    },
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
    launcher,
}

contextBridge.exposeInMainWorld(
    "api",
    API
)

contextBridge.exposeInMainWorld(
    "log",
    log
)



