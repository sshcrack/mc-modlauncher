import { dialog, ipcMain, IpcMainEvent } from 'electron';
import fs from "fs";
import path from "path";
import { v4 as randomUUID } from "uuid";
import { InstallManager } from '.';
import { MainGlobals } from '../../Globals/mainGlobals';
import { MainLogger } from '../../interfaces/mainLogger';
import { Progress } from './event/interface';
import { getInstanceVersion } from './processors/interface';


const logger = MainLogger.get("InstallManager", "Events")
export function setupInstallManagerEvents() {
    const { addLock, hasLock, removeLock, remove, install } = InstallManager;

    const onUpdate = (event: IpcMainEvent, id: string, prog: Progress) => event.reply("modpack_update", id, prog)
    const sendLockInfo = (event: IpcMainEvent, id: string) => event.reply("modpack_error", id, "Another installation is in progress")
    const defaultPromReply = async (event: IpcMainEvent, id: string, prom: Promise<void>) => {
        const err = await prom
            .then(() => {/**/ })
            .catch(e => e as Error);

        if (err)
            return event.reply("modpack_error", id, err)

        event.reply("modpack_success", id)
    }

    ipcMain.on("install_modpack", async (event, id, overwrite) => {
        if (hasLock(id))
            return sendLockInfo(event, id)

        addLock(id)
        const prom = install(id, !!overwrite, prog => onUpdate(event, id, prog));

        await defaultPromReply(event, id, prom)
        removeLock(id)
    })

    ipcMain.on("update_modpack", async (event, id) => {
        if (hasLock(id))
            return sendLockInfo(event, id)

        addLock(id)

        logger.info("Updating modpack", id)
        const prom = install(id, true, prog => onUpdate(event, id, prog));

        await defaultPromReply(event, id, prom)
        removeLock(id)
    })

    ipcMain.on("modpack_remove", async (event, id) => {
        if (hasLock(id))
            return sendLockInfo(event, id)

        addLock(id)
        const prom = remove(id)
        await defaultPromReply(event, id, prom)

        removeLock(id)
    })

    ipcMain.on("get_version", (event, id) => {
        event.returnValue = getInstanceVersion(id);
    })

    ipcMain.on("clean_corrupted", event => {
        cleanCorrupted()
            .then(() => event.reply("clean_corrupted_success"))
            .catch(e => event.reply("clean_corrupted_error", e))
    })

    ipcMain.on("get_installed", event => {
        event.returnValue = getInstalled()
    })

    ipcMain.on("is_installed", (event, id) => {
        logger.log("Is installed", id, getInstalled(), getInstalled().includes(id))
        event.returnValue = getInstalled().includes(id)
    })

    ipcMain.on("open_err_dialog", (e, str) => dialog.showErrorBox("Error", str))
}


export async function cleanCorrupted() {
    logger.info("Cleaning up corrupted installations")
    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(instances))
        return;

    const cleared = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => !e.includes("-corrupted"))
        .map(e => {
            const instancePath = path.join(instances, e);
            const creating = MainGlobals.getCreatingFile(installDir, e)
            const uuid = randomUUID()

            if (!fs.existsSync(creating))
                return null

            const dest = instancePath + uuid + "-corrupted"
            logger.debug("Moving", instancePath, "to", dest)

            return fs.promises.rename(instancePath, dest)
        }).filter(e => e)

    await Promise.all(cleared)
    const length = cleared.length;
    if (length > 0)
        logger.info("Cleared", length, "corrupted installations")
}

export function getInstalled(): string[] {
    logger.debug("Getting installed instances...")

    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(instances))
        fs.mkdirSync(instances, { recursive: true })

    const ids = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => {
            const creating = MainGlobals.getCreatingFile(installDir, e)
            const files = fs.readdirSync(path.join(instances, e))

            return !fs.existsSync(creating) && files.length !== 0
        })


    logger.debug("Found", ids, " installed instances", "inDir", instances, "installdir", installDir)
    return ids
}