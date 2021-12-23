import { ipcMain, IpcMainEvent } from 'electron';
import fs from "fs";
import got from "got";
import path from "path";
import { Globals } from "../Globals";
import { MainGlobals } from '../Globals/mainGlobals';
import { Logger } from '../interfaces/logger';
import { Modpack } from '../interfaces/modpack';
import { getInstalled } from '../preload/instance';
import { Progress } from './event/interface';
import { AdditionalOptions, ProcessEventEmitter } from './event/Processor';
import { getVersionsDir } from './General/mcBase';
import { ForgeDownloader } from './processors/forge/downloader';
import { McJarDownloader } from './processors/forge/jar/mcJarDownloader';
import { ForgeManifestCopier } from './processors/forge/manifest/forgeManifest';
import { VanillaManifestDownloader } from './processors/forge/manifest/vanillaManifest';
import { PostProcessor } from './processors/forge/postProcessors/PostProcessor';
import { ForgeUnpacker } from './processors/forge/unpacker';
import { getInstanceVersion, getInstanceVersionPath, SharedMap } from './processors/interface';
import { AssetCopier } from './processors/launcher/assetCopier';
import { LauncherDownloader } from './processors/launcher/downloader';
import { getLauncherExe } from './processors/launcher/file';
import { LauncherUnpacker } from './processors/launcher/unpacker';
import { LibraryMultipleDownloader } from './processors/libraries/LibraryMultiple';
import { ModpackDownloader } from './processors/modpack/downloader';
import { ModpackUnpacker } from './processors/modpack/unpacker';

const baseUrl = Globals.baseUrl;
const logger = Logger.get("InstallManager")
export class InstallManager {
    private static async getConfig(id: string) {
        const configRes = await got(`${baseUrl}/${id}/config.json`)

        if (!configRes)
            return;

        return JSON.parse(configRes.body) as Modpack;
    }

    static async install(id: string, event: IpcMainEvent, update = false) {
        logger.info("Installing modpack", id)
        const installDir = MainGlobals.getInstallDir();
        const installations = getInstalled();
        const instanceDir = Globals.getInstancePathById(installDir, id);

        const sendUpdate = ({percent, status}: Progress) =>
            event.reply("modpack_update", id, percent, status)

        const reportError = (err: string) => {
            fs.rmSync(instanceDir, { recursive: true, force: true });
            event.reply("modpack_error", id, err);
        }



        logger.debug("Making directory", id)
        if (!fs.existsSync(instanceDir))
            fs.mkdirSync(instanceDir);

        if (installations.includes(id) && !update)
            return reportError("Modpack already installed.")

        sendUpdate({ percent: 0, status: "Getting config..."})

        logger.debug("Getting config", id)
        const config = await InstallManager.getConfig(id)
            .catch(e => reportError(e));

        logger.silly("Config is", config)
        if (!config) {
            return reportError("Could not download modpack configuration")
        }

        const createFile = Globals.getCreatingFile(installDir, id);
        fs.writeFileSync(createFile, "")

        const res = await this.runProcessors(id, config, update, {
            sendUpdate,
            reportError
        });

        if(!res)
            return;

        try {
            fs.rmSync(createFile)
        } catch(e) {/** */}

        const installedPath = getInstanceVersionPath(id);
        const lastVersion = Globals.getLastVersion(config);

        fs.writeFileSync(installedPath, JSON.stringify(lastVersion))
        event.reply("modpack_success", id)
    }

    private static async runProcessors(id: string, config: Modpack, overwrite: boolean, { sendUpdate, reportError}: ReportFunctions) {
        const lastVer = Globals.getLastVersion(config);

        const { forge_version: forgeVersion } = lastVer

        const options: AdditionalOptions = { overwrite }
        const sharedMap: SharedMap = {}

        const modpack = [
            ModpackDownloader,
            ModpackUnpacker,
        ]

        const launcher = [
            LauncherDownloader,
            LauncherUnpacker,
            AssetCopier
        ]

        const forge = [
            VanillaManifestDownloader,
            McJarDownloader,
            ForgeDownloader,
            ForgeUnpacker,
            ForgeManifestCopier,
            LibraryMultipleDownloader,
            PostProcessor
        ]

        const versionDir = getVersionsDir();
        const forgeDir = path.join(versionDir, forgeVersion)

        const launcherExe = getLauncherExe()

        const hasLauncher = fs.existsSync(launcherExe)
        const hasForge = fs.existsSync(forgeDir)

        const toExecute = [
            ...modpack,
            ...(hasLauncher ? [] : launcher),
            ...(hasForge ? [] : forge)
        ]

        const processors = toExecute.map(e => new e(id, config, options, sharedMap))
        logger.debug("Starting processors hasLauncher", hasLauncher, "hasForge", hasForge, "id", id, "ForgeDir", forgeDir, "LauncherExe", launcherExe)

        return await ProcessEventEmitter.runMultiple(processors, p => sendUpdate(p))
            .then(() => true)
            .catch(e => reportError(e))
    }

    static async remove(id: string, event: IpcMainEvent) {
        const installDir = MainGlobals.getInstallDir();
        const instanceDir = Globals.getInstancePathById(installDir, id);

        logger.info("Removing modpack", id, "at path", instanceDir)
        fs.promises.rmdir(instanceDir, { recursive: true })
            .then(() => {
                logger.info("Removed modpack with id", id)
                event.reply("remove_modpack_success", id)
            })
            .catch(e => {
                logger.error("Failed to remove modpack", id, e)
                event.reply("remove_modpack_error", id, e)
            })
    }

    static addListeners() {
        const sendEvent = (event: IpcMainEvent, name: string) => event.reply(name, "Another installation is in progress")

        ipcMain.on("install_modpack", async (event, id, overwrite) => {
            if(this.hasLock(id))
                return sendEvent(event, "modpack_error")

            this.addLock(id)
            await InstallManager.install(id, event, !!overwrite);
            this.removeLock(id)
        })

        ipcMain.on("update_modpack", (event, id) => {
            if(this.hasLock(id))
                return sendEvent(event, "modpack_error")

            logger.info("Updating modpack", id)
            InstallManager.install(id, event, true)
        })

        ipcMain.on("remove_modpack", async (event, id) => {
            if(this.hasLock(id))
                return sendEvent(event, "remove_modpack_error")

            this.addLock(id)
            await InstallManager.remove(id, event);
            this.removeLock(id)
        })

        ipcMain.on("get_version", (event, id) => {
            event.returnValue = getInstanceVersion(id);
        })
    }

    private static locks: string[] = []
    static hasLock(id: string) {
        return this.locks.includes(id)
    }

    static removeLock(id: string) {
        this.locks = this.locks.filter(e => e !== id)
    }

    static addLock(id: string) {
        this.locks.push(id);
    }
}

interface ReportFunctions {
    sendUpdate: (progress: Progress) => void,
    reportError: (err: string) => void
}