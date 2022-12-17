import { ipcRenderer } from 'electron';
import { MainLogger } from '../interfaces/mainLogger';
import { ModpackInfo } from '../interfaces/modpack';

const logger = MainLogger.get("preload", "launcher")

const listeners: { [key: string]: (launching: boolean) => void} = {}
ipcRenderer.send("add_launch_listener");
ipcRenderer.on("launch_update", (_, launching: string[]) => {
    Object.entries(listeners).map(([key, func]) => {
        logger.info("Sending launch update for", key, launching.includes(key))
        func(launching.includes(key))
    })
})

export const launcher = {
    launch:  async (id: string, config: ModpackInfo) => {
        return new Promise<void>((resolve, reject) => {
            ipcRenderer.once("launched_mc_success", () => resolve())
            ipcRenderer.once("launched_mc_error", (_, e) => reject(e))
            ipcRenderer.send("launch_mc", id, config)
        });
    },
    isLaunching: (id: string) => ipcRenderer.sendSync("is_launching", id) as boolean,
    addLaunchListener: (id: string, callback: (launching: boolean) => void) => listeners[id] = callback
}