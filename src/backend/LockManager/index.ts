import { ipcMain, WebContents } from 'electron'
import { MainLogger } from '../../interfaces/mainLogger'

let locked = false
const logger = MainLogger.get("Preload", "Lock")
const listeners: WebContents[] = []

export function addLockListeners() {
    ipcMain.on("set_lock", (e, lock) => {
        logger.log("Setting lock...")
        if(locked === lock)
            return e.returnValue = true

        locked = lock

        logger.log("Sending lock update...", listeners.length)
        listeners.map(e => e.send("lock_update", locked))
        e.returnValue = true
    })

    ipcMain.on("add_lock_listener", e => {
        logger.log("New lock listener")
        listeners.push(e.sender)
    })

    ipcMain.on("is_locked", e => {
        logger.info("Is locked", locked)
        e.returnValue = locked
    })
}