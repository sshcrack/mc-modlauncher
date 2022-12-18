import { ipcMain } from 'electron';
import { existsSync } from 'fs';
import path from "path";
import psList from 'ps-list';
import { MainGlobals } from '../../Globals/mainGlobals';
import { MainLogger } from '../../interfaces/mainLogger';
import { getLauncherDir, getLauncherExe } from '../InstallManager/processors/launcher/file';
import LockManager from '../LockManager';
import { getJavaDownloadDest } from '../LockManager/java/file';
import { moveDirectory } from '../main/folder';


const logger = MainLogger.get("Backend", "InstallMover")
export class InstallMover {
    static addListeners() {
        ipcMain.on("install_move", async (e, dest: string) => {
            if (LockManager.isLocked())
                return e.reply("install_move_error", "Another installation is in progress")


            const procList = await psList()
            const baseLauncher = path.basename(getLauncherExe())
            const baseJava = path.basename(getJavaDownloadDest())

            const hasMC = procList.some(e => e.name === baseJava)
            const hasLauncher = procList.some(e => e.name === baseLauncher)


            if (hasMC || hasLauncher)
                return e.reply("install_move_error", "Minecraft or Launcher is already running.")

            const src = MainGlobals.getInstallDir()

            LockManager.lock({
                percent: 0,
                status: "Moving installation folder..."
            })


            this.move(src, dest)
                .then(() => {
                    LockManager.unlock({
                        percent: 1,
                        status: "Done moving!"
                    })

                    e.reply("install_move_success")
                })
                .catch(e => {
                    LockManager.unlock({
                        percent: 1,
                        status: `Error moving: ${e?.message ?? e}`
                    })
                    e.reply("install_move_error", e)
                })
        })
    }

    static async move(src: string, dest: string) {
        const moveFolders = [
            [
                MainGlobals.getInstanceDir(src),
                MainGlobals.getInstanceDir(dest)
            ],
            [
                getLauncherDir(src),
                getLauncherDir(dest)
            ]
        ]

        const srcFoldersExist = moveFolders.map(f => f[0])
            .every(e => existsSync(e))

        if (!srcFoldersExist)
            return logger.info("Some folders could not be found", srcFoldersExist)

        const length = moveFolders.length
        for (let i = 0; i < length; i++) {
            const [src, dest] = moveFolders[i]

            await moveDirectory({
                src,
                dest,
                onUpdate: prog => {
                    const percent = i / length + prog.percent / length
                    LockManager.updateListeners({ percent, status: `Moving ${src} to ${dest}...` })
                }
            })
        }
    }
}