import { ipcRenderer } from 'electron'
import { MainLogger } from '../interfaces/mainLogger'

const lockListeners: ((locked: boolean) => unknown)[] = []

const logger = MainLogger.get("Preload", "Lock")
ipcRenderer.on("lock_update", (_, locked) => {
    logger.info("Locked update")
    lockListeners.map((func) => func(locked))
})
ipcRenderer.send("add_lock_listener")

export const lock = {
    addLockListener: (func: (locked: boolean) => unknown) => lockListeners.push((e) => func(e)),
    isLocked: () => ipcRenderer.sendSync("is_locked") as boolean,
    lock: () => ipcRenderer.sendSync("set_lock", true),
    unlock: () => ipcRenderer.sendSync("set_lock", false)
}