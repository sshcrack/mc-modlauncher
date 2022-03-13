import { dialog, ipcMain, IpcMainEvent } from 'electron';
import fs from "fs";
import { glob } from 'glob';
import got from "got";
import path from "path";
import { v4 as randomUUID } from "uuid";
import { InstallManager } from '.';
import { Globals } from '../../Globals';
import { MainGlobals } from '../../Globals/mainGlobals';
import { MainLogger } from '../../interfaces/mainLogger';
import { ModpackInfo, Version } from '../../interfaces/modpack';
import { Progress } from './event/interface';
import { getInstanceVersion, getInstanceVersionFileName, getInstanceVersionPath } from './processors/interface';


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

    ipcMain.on("install_modpack", async (event, id, overwrite, version) => {
        if (hasLock(id))
            return sendLockInfo(event, id)

        addLock(id)
        const prom = install(id, !!overwrite, version, prog => onUpdate(event, id, prog));

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
            .then(e => event.reply("clean_corrupted_success", e))
            .catch(e => event.reply("clean_corrupted_error", e))
    })

    ipcMain.on("get_installed", event => {
        event.returnValue = getInstalled()
    })

    ipcMain.on("is_installed", (event, id) => {
        const installed = getInstalled()
        logger.log("Is installed", id, installed, installed.includes(id))
        event.returnValue = installed.includes(id)
    })

    ipcMain.on("open_err_dialog", (e, str) => dialog.showErrorBox("Error", str))
}


export async function cleanCorrupted(): Promise<number> {
    logger.info("Cleaning up corrupted installations")
    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(instances))
        return 0;

    const cleared = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => !e.includes("-corrupted"))
        .map(async e => {
            const instancePath = path.join(instances, e);
            const creating = MainGlobals.getCreatingFile(installDir, e)
            const versionFile = getInstanceVersionPath(e)
            const uuid = randomUUID()

            if (fs.existsSync(versionFile)) {
                try {
                    const rawVersion = fs.readFileSync(versionFile, "utf8")
                    const version = JSON.parse(rawVersion) as Version;

                    if (version?.forge_version)
                        return null


                    const currVersions = await got(`${Globals.baseUrl}/${e}/config.json`)
                        .json()
                        .then(e => e as ModpackInfo)
                        .then(json => json.versions)

                    const nonCorrupted = currVersions.find(e => e.id === version.id);
                    fs.writeFileSync(versionFile, JSON.stringify(nonCorrupted))

                    return null
                } catch { /** Catching bc it could be corrupt so delete */ }
            }

            if (!fs.existsSync(creating))
                return null

            const dest = instancePath + uuid + "-corrupted"
            logger.debug("Moving", instancePath, "to", dest)

            await fs.promises.rename(instancePath, dest)
        })

    const res = await Promise.all(cleared)
    const length = res.filter(e => !!e).length;
    if (length > 0)
        logger.info("Cleared", length, "corrupted installations")

    return length
}

export function getInstalled(): string[] {
    logger.debug("Getting installed instances...")

    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(instances))
        fs.mkdirSync(instances, { recursive: true })

    const occurred = [""]

    const globPattern = `${instances}/**/${getInstanceVersionFileName()}`
    const ids = glob.sync(globPattern)
        .map(e => path.dirname(e))
        .map(e => {
            console.log("E is", e, "Install Dir", instances)
            return path.relative(instances, e)
        })
        .map(e => e.substring(e.length -1) === "/" ? e.substring(0, e.length - 1) : e)
        .filter(e => {
            if(occurred.includes(e))
                return false
            occurred.push(e)
            return true
        })
        .filter(e => {
            console.log("Installed", e)
            const creating = MainGlobals.getCreatingFile(installDir, e)
            if(fs.existsSync(creating))
                return false

            const currPath = path.join(instances, e)

            const files = fs.readdirSync(currPath)
            const modFolder = MainGlobals.getModFolder(instances, e)
            return files.length !== 0 && fs.existsSync(modFolder)
        })
        .map(e => e.split("\\").join("/"))


    logger.debug("Found", ids, " installed instances", "inDir", instances, "installdir", installDir)
    return ids
}