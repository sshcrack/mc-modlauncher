import { dialog, ipcMain, IpcMainEvent } from 'electron';
import fs from "fs";
import { readdir, stat } from "fs/promises";
import { glob } from 'glob';
import got from "got";
import path from "path";
import { promisify } from "util";
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

    ipcMain.on("get_installed", async event => {
        const installed = await getInstalled()
        event.reply("get_installed_reply", installed)
    })

    ipcMain.on("is_installed", async (e, id) => {
        const installed = await getInstalled()

        e.reply("is_installed_reply", id, installed.includes(id))
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

export async function getInstalled(): Promise<string[]> {
    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(instances))
        fs.mkdirSync(instances, { recursive: true })

    const occurred = [""]
    const ids: string[] = []

    const globPattern = `${instances}/**/${getInstanceVersionFileName()}`
    const files = await promisify(glob)(globPattern)

    for (const e of files) {
        const relativeFile = path.relative(instances, path.dirname(e))
        const id = relativeFile.substring(relativeFile.length -1) === "/" ? relativeFile.substring(0, relativeFile.length - 1) : relativeFile
        if(occurred.includes(e))
            continue

        occurred.push(e)

        const creating = MainGlobals.getCreatingFile(installDir, e)
        const creatingExists = await stat(creating)
            .then(() => true)
            .catch(() => false)

        if(creatingExists)
            continue

        const currPath = path.join(instances, id)
        const dirsInInstance = await readdir(currPath)
            .catch(() => [])
        const modFolder = MainGlobals.getModFolder(instances, id)

        const modFolderExists = await stat(modFolder)
            .then(() => true)
            .catch(() => false)

        if(dirsInInstance.length === 0 || !modFolderExists)
            continue

        ids.push(id.split("\\").join("/"))
    }

    return ids
}