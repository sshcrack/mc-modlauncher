import fs from "fs";
import got from "got";
import { Globals } from "../../Globals";
import { MainGlobals } from '../../Globals/mainGlobals';
import { MainLogger } from '../../interfaces/mainLogger';
import { ModpackInfo, Version } from '../../interfaces/modpack';
import { Progress } from './event/interface';
import { ProcessEventEmitter } from './event/Processor';
import { getInstalled, setupInstallManagerEvents } from './events';
import { getProcessors } from './processorList';
import { getInstanceVersionPath } from './processors/interface';

const baseUrl = Globals.baseUrl;
const logger = MainLogger.get("InstallManager")
export class InstallManager {
    static initialize() {
        setupInstallManagerEvents()
    }

    private static async getConfig(id: string) {
        const configRes = await got(`${baseUrl}/${id}/config.json`)

        if (!configRes)
            return;

        return JSON.parse(configRes.body) as ModpackInfo;
    }

    static async install(id: string, update = false, version: Version, onUpdateChilds: (prog: Progress) => void) {
        logger.info("Installing modpack", id)
        const installDir = MainGlobals.getInstallDir();
        const installations = getInstalled();
        const instanceDir = MainGlobals.getInstancePathById(installDir, id);

        const reportError = (err: string) => {
            fs.rmSync(instanceDir, { recursive: true, force: true });
            throw new Error(err);
        }

        const onUpdate = (prog: Progress) => {
            onUpdateChilds(prog);

            MainGlobals.window.setProgressBar(prog.percent)
        }

        logger.debug("Making directory", id)
        if (!fs.existsSync(instanceDir))
            fs.mkdirSync(instanceDir, { recursive: true });

        if (installations.includes(id) && !update)
            return reportError("Modpack already installed.")

        onUpdate({ percent: 0, status: "Getting config..."})

        logger.debug("Getting config", id)
        const config = await InstallManager.getConfig(id)
            .catch(e => reportError(e));

        logger.silly("Config is", config)
        if (!config) {
            return reportError("Could not download modpack configuration")
        }

        const createFile = MainGlobals.getCreatingFile(installDir, id);
        fs.writeFileSync(createFile, "")

        const res = await InstallManager.runProcessors(id, config, version, update, {
            onUpdate,
            reportError
        });

        MainGlobals.window.setProgressBar(0)
        if(!res)
            return;

        try {
            fs.rmSync(createFile)
        } catch(e) {/** */}

        const installedPath = getInstanceVersionPath(id);

        fs.writeFileSync(installedPath, JSON.stringify(version))
    }

    private static async runProcessors(id: string, config: ModpackInfo, version: Version, overwrite: boolean, { onUpdate: sendUpdate, reportError}: ReportFunctions) {
        const processors = getProcessors(id, config, version, overwrite);

        return await ProcessEventEmitter.runMultiple(processors, p => sendUpdate(p))
            .then(() => true)
            .catch(e => reportError(e))
    }

    static async remove(id: string) {
        return new Promise<void>((resolve, reject) => {
            const installDir = MainGlobals.getInstallDir();
            const instanceDir = MainGlobals.getInstancePathById(installDir, id);

            logger.info("Removing modpack", id, "at path", instanceDir)
            fs.promises.rm(instanceDir, { recursive: true })
                .then(() => {
                    logger.log("Removed modpack", id)
                    resolve()
                })
                .catch(e => {
                    logger.error("Failed to remove modpack", id, e)
                    reject(e)
                })
        });
    }

    private static locks: string[] = []
    static hasLock(id: string) {
        return InstallManager.locks.includes(id)
    }

    static removeLock(id: string) {
        InstallManager.locks = InstallManager.locks.filter(e => e !== id)
    }

    static addLock(id: string) {
        InstallManager.locks.push(id);
    }
}

interface ReportFunctions {
    onUpdate: (progress: Progress) => void,
    reportError: (err: string) => void
}