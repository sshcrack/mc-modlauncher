import { ipcMain } from 'electron'
import { MainLogger } from '../../interfaces/mainLogger'

let locked = false
const logger = MainLogger.get("Preload", "Lock")
export function addLockListeners() {
    ipcMain.on("set_lock", (e, lock) => {
        logger.log("Setting lock...")
        if(locked === lock)
            return e.returnValue = true

        locked = lock

        logger.log("Sending lock update...")
        e.sender.send("lock_update", locked)
        e.returnValue = true
    })

    ipcMain.on("is_locked", e => {
        logger.info("Is locked", locked)
        e.returnValue = locked
    })
}