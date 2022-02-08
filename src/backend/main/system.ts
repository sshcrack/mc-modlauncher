import { MainLogger } from '../../interfaces/mainLogger'
import { ipcMain } from 'electron'
import os from "os"
import fs from "fs"
import checkDisk from "check-disk-space"
import folderSize from "fast-folder-size"
import prettyBytes from 'pretty-bytes'

const logger = MainLogger.get("Backend", "Main", "System");
export function addSystemListeners() {
    ipcMain.on("get_mem", e => {
        const mem = os.totalmem();
        e.reply("get_mem_reply", mem)
    })

    ipcMain.on("exists_folder", (e, p) => e.returnValue = fs.existsSync(p) && fs.lstatSync(p).isDirectory())
    ipcMain.on("size_folder", (e, folder) => {
        logger.debug("Getting folder size of", folder)
        folderSize(folder, (err, bytes) => {
            e.reply("size_folder_reply", folder, err ? NaN : bytes)
            if (err)
                return logger.error("Could not get folder size of", folder, err)

            logger.debug("Folder size for", folder, "is", prettyBytes(bytes))
        })
    })

    ipcMain.on("system_disk_size", (e, diskPath) => {
        logger.debug("Getting disk size of", diskPath)
        checkDisk(diskPath)
            .then(info => {
                const loggerInfo = Object.fromEntries(
                    Object.entries(info)
                        .map(([k, v]) =>
                            typeof v === "number" ?
                                [k, prettyBytes(v)] : [k, v]
                        ))

                logger.debug("Disk size for", diskPath, "is", JSON.stringify(loggerInfo, null, 2))
                e.reply("system_disk_size_reply", diskPath, info)
            })
            .catch(err => {
                logger.error("Could not get disk size of", diskPath, err)

                e.reply("system_disk_size_reply", diskPath, undefined)
            })
    })
}