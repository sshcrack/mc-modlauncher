import { ipcRenderer } from 'electron';
import { Progress } from '../backend/InstallManager/event/interface';
import { MainLogger } from '../interfaces/mainLogger';
import { Version } from '../interfaces/modpack';
import { ModpackOrganizer, ModpackTypes, onUpdate } from './interface';

const logger = MainLogger.get("preload", "modpack")
export const modpackOrganizer: ModpackOrganizer = {}

function startProcessing(id: string, overwrite: boolean, version: Version, onUpdate: onUpdate) {
    const type = modpackOrganizer[id]?.type;
    if (type === ModpackTypes.INSTALLING || type === undefined)
        ipcRenderer.send("install_modpack", id, overwrite, version);

    return registerModpack(id, ModpackTypes.INSTALLING, onUpdate)
}

function registerModpack(id: string, type: ModpackTypes, onUpdate: onUpdate) {
    return new Promise<void>((resolve, reject) => {
        if (!modpackOrganizer[id]) {
            logger.log("Registered modpack", id)
            const prog = {
                percent: 0,
                status: "Initializing..."
            }

            onUpdate(prog)
            return modpackOrganizer[id] = {
                type: type,
                currently: prog,
                listeners: {
                    update: [onUpdate],
                    error: [(e) => reject(e)],
                    success: [() => resolve()]
                }
            }
        }

        const modType = modpackOrganizer[id].type
        let strType: string;
        switch (modType) {
            case ModpackTypes.INSTALLING:
                strType = "installing"
                break;

            case ModpackTypes.REMOVING:
                strType = "removing"
                break;
        }

        if (modType !== type) {
            const err = new Error(`Modpack is already ${strType}.`)

            return reject(err)
        }

        logger.log("Registered modpack", id)
        onUpdate(modpackOrganizer[id].currently)

        modpackOrganizer[id].listeners.success.push(() => resolve())
        modpackOrganizer[id].listeners.error.push(e => reject(e))
        modpackOrganizer[id].listeners.update.push(onUpdate)
    });
}

function removeModpack(id: string, onUpdate: onUpdate) {
    const type = modpackOrganizer[id]?.type;
    if (type === ModpackTypes.INSTALLING || type === undefined)
        ipcRenderer.send("modpack_remove", id);

    return registerModpack(id, ModpackTypes.INSTALLING, onUpdate)
}

function cleanCorrupted() {
    return new Promise<void>((resolve, reject) => {
        ipcRenderer.on("clean_corrupted_suuccess", () => resolve())
        ipcRenderer.on("clean_corrupted_error", (e, err) => reject(err))

        ipcRenderer.send("clean_corrupted")
    });
}

function isInstalled(id: string) {
    return ipcRenderer.sendSync("is_installed", id) as boolean
}

export const modpack = {
    isInstalled: (id: string) => isInstalled(id),
    getProcessingType: (id: string) => modpackOrganizer[id]?.type,
    version: (id: string) => ipcRenderer.sendSync("get_version", id) as Version,
    remove: (id: string, onUpdate: onUpdate) => removeModpack(id, onUpdate),
    install: (id: string, onUpdate: onUpdate, version: Version) => startProcessing(id, false, version, onUpdate),
    update: (id: string, onUpdate: onUpdate, version: Version) => startProcessing(id, true, version, onUpdate),
    list: () => ipcRenderer.sendSync("get_installed") as string[],
    clean: () => cleanCorrupted(),
}


ipcRenderer.on("modpack_update", (_, id: string, progress: Progress) => {
    const entry = modpackOrganizer[id]
    if (!entry)
        return logger.error("No Modpack entry found for", id)

    entry.currently = progress;
    entry.listeners?.update?.forEach(e => e(progress))
})

ipcRenderer.on("modpack_success", (_, id) => {
    const entry = modpackOrganizer[id]
    if (!entry)
        return logger.error("Can't fire success for", id)

    logger.log("Firing success for", id)
    entry.listeners?.success?.forEach(e => e())

    delete modpackOrganizer[id]
})

ipcRenderer.on("modpack_error", (_, id, err) => {
    logger.error("Error for", id, err)

    const entry = modpackOrganizer[id]
    if (!entry)
        return logger.error("Can't fire error for", id)

    logger.log("Firing error for", id)
    entry.listeners?.error?.forEach(e => e(err))

    delete modpackOrganizer[id]
})
