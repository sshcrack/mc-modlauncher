import { ipcMain } from 'electron'
import { MainGlobals } from '../../Globals/mainGlobals'
import { MainLogger } from '../../interfaces/mainLogger'
import { Progress } from '../InstallManager/event/interface'

const logger = MainLogger.get("Preload", "Lock")
const { lockInfo } = MainGlobals
export default class LockManager {
    static addLockListeners() {

        ipcMain.on("set_lock", (e, lock: boolean, prog: Progress) => {
            logger.log("Setting lock...")

            if (lockInfo.locked === lock)
                return e.returnValue = true

            if (lock)
                LockManager.lock(prog)
            else
                LockManager.unlock(prog)

            e.returnValue = true
        })

        ipcMain.on("update_lock", (e, prog: Progress) => {
            LockManager.updateListeners(prog)
            e.returnValue = true
        })

        ipcMain.on("add_lock_listener", e => lockInfo.listeners.push(e.sender))
        ipcMain.on("is_locked", e => e.returnValue = {
            locked: lockInfo.locked,
            progress: lockInfo.currProgress
        })
    }

    static lock(prog: Progress) {
        const { lockInfo } = MainGlobals

        logger.log("Locking...")
        lockInfo.locked = true

        this.updateListeners(prog)
    }

    static unlock(prog: Progress) {
        const { lockInfo } = MainGlobals

        logger.log("Unlocking...")
        lockInfo.locked = false
        lockInfo.lockListeners.map(e => e())

        this.updateListeners(prog)
    }

    static lockProm() {
        return new Promise<void>(resolve => {
            if(!this.isLocked())
                return resolve()

            lockInfo.lockListeners.push(() => resolve())
        });
    }

    static isLocked() {
        return lockInfo.locked
    }

    static updateListeners(prog: Progress) {
        // eslint-disable-next-line prefer-const
        let { listeners, currProgress, locked } = lockInfo

        currProgress = prog
        listeners.map(e => e.send("lock_update", locked, currProgress))
    }
}