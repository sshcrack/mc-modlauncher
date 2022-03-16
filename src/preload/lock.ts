import { ipcRenderer } from 'electron'
import { Progress } from '../backend/InstallManager/event/interface'
import { MainLogger } from '../interfaces/mainLogger'

const lockListeners: ListenerFunc[] = []

const logger = MainLogger.get("Preload", "Lock")
ipcRenderer.on("lock_update", (_, locked, progress: Progress) => {
    logger.info("Locked update")
    lockListeners.map((func) => func(locked, progress))
})

ipcRenderer.send("add_lock_listener")

export const lock = {
    addLockListener: (func: ListenerFunc) => lockListeners.push((a, b) => func(a, b)),
    isLocked: () => ipcRenderer.sendSync("is_locked") as LockedReturnType,
    lock: (prog: Progress) => setLock(true, prog),
    unlock: (prog: Progress) => setLock(false, prog),
    update: (prog: Progress) => ipcRenderer.send("update_lock", prog)
}

function setLock(locked: boolean, prog: Progress) {
    ipcRenderer.sendSync("set_lock", locked, prog)
}

export type ListenerFunc = (locked: boolean, progress: Progress) => unknown
export type LockedReturnType = {
    locked: boolean,
    progress: Progress
}