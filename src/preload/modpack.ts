import { ipcRenderer } from 'electron';
import { Progress } from '../backend/InstallManager/event/interface';
import { MainLogger } from '../interfaces/mainLogger';
import { Version } from '../interfaces/modpack';
import { ModpackOrganizer, ModpackTypes, onUpdate } from './interface';

const logger = MainLogger.get("preload", "modpack")
export const modpackOrganizer: ModpackOrganizer = {}
const listenerFuncs: { [key: string]: ((processing: boolean) => unknown)[] } = {}

function startProcessing(id: string, overwrite: boolean, version: Version, onUpdate: onUpdate) {
    const type = modpackOrganizer[id]?.type;
    if (type === ModpackTypes.INSTALLING || type === undefined)
        ipcRenderer.send("install_modpack", id, overwrite, version);

    return registerModpack(id, ModpackTypes.INSTALLING, onUpdate)
}

function registerModpack(id: string, type: ModpackTypes, onUpdate: onUpdate) {
    return new Promise<void>((resolve, reject) => {
        const processListenerFuncs = (processing: boolean) => listenerFuncs[id]?.forEach(func => func(processing))
        if (!modpackOrganizer[id]) {
            logger.log("Registered modpack", id)
            const prog = {
                percent: 0,
                status: "Initializing..."
            }

            onUpdate(prog)
            processListenerFuncs(true)
            return modpackOrganizer[id] = {
                type: type,
                currently: prog,
                listeners: {
                    update: [onUpdate],
                    error: [(e) => reject(e), () => processListenerFuncs(false) ],
                    success: [() => resolve(), () => processListenerFuncs(false) ]
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
    return new Promise<number>((resolve, reject) => {
        ipcRenderer.on("clean_corrupted_success", (_, res) => resolve(res))
        ipcRenderer.on("clean_corrupted_error", (_, err) => reject(err))

        ipcRenderer.send("clean_corrupted")
    });
}

function isInstalled(id: string) {
    return new Promise<boolean>(resolve => {
        ipcRenderer.on("is_installed_reply", (e, innerId, installed) => {
            if(innerId !== id)
                return

            resolve(installed)
        })
        ipcRenderer.send("is_installed", id)
    });
}

function getInstalled() {
    return new Promise<string[]>(resolve => {
        ipcRenderer.on("get_installed_reply", (e, installed) => resolve(installed))
        ipcRenderer.send("get_installed")
    });

}

function addProcessingListener(id: string, func: (processing: boolean) => unknown) {
    listenerFuncs[id] = (listenerFuncs[id] ?? []).concat(func)
}

export const modpack = {
    isInstalled: (id: string) => isInstalled(id),
    getProcessingType: (id: string) => modpackOrganizer[id]?.type,
    version: (id: string) => ipcRenderer.sendSync("get_version", id) as Version,
    remove: (id: string, onUpdate: onUpdate) => removeModpack(id, onUpdate),
    install: (id: string, onUpdate: onUpdate, version: Version) => startProcessing(id, false, version, onUpdate),
    update: (id: string, onUpdate: onUpdate, version: Version) => startProcessing(id, true, version, onUpdate),
    list: () => getInstalled(),
    clean: () => cleanCorrupted(),
    addProcessingListener: (id: string, func: (processing: boolean) => unknown) => addProcessingListener(id, func),
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
