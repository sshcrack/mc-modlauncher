import { ipcMain, IpcMainEvent } from 'electron';
import fs from "fs";
import got from "got";
import { Globals } from "../Globals";
import { MainGlobals } from '../Globals/mainGlobals';
import { Logger } from '../interfaces/logger';
import { Modpack } from '../interfaces/modpack';
import { getInstalled } from '../preload/instance';
import { Progress } from './event/interface';
import { AdditionalOptions, ProcessEventEmitter } from './event/Processor';
import { ForgeDownloader } from './processors/forge/downloader';
import { ForgeManifestCopier } from './processors/forge/manifest/forgeManifest';
import { VanillaManifestDownloader } from './processors/forge/manifest/vanillaManifest';
import { ForgeUnpacker } from './processors/forge/unpacker';
import { LauncherDownloader } from './processors/launcher/downloader';
import { LauncherUnpacker } from './processors/launcher/unpacker';
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

    static async install(id: string, event: IpcMainEvent, overwrite = false) {
        logger.await("Installing modpack", id)
        const installDir = MainGlobals.getInstallDir();
        const installations = getInstalled();
        const instanceDir = Globals.getInstancePathById(installDir, id);

        const sendUpdate = ({percent, status}: Progress) =>
            event.reply("modpack_update", id, percent, status)

        const reportError = (err: string) => {
            fs.rmSync(instanceDir, { recursive: true, force: true });
            event.reply("modpack_error", id, err);
        }



        logger.await("Making directory", id)
        if (!fs.existsSync(instanceDir))
            fs.mkdirSync(instanceDir);

        if (installations.includes(id) && !overwrite)
            return reportError("Modpack already installed.")

        sendUpdate({ percent: 0, status: "Getting config..."})
        logger.await("Getting config", id)
        const config = await InstallManager.getConfig(id)
            .catch(e => reportError(e));

        if (!config)
            return;

        const options: AdditionalOptions = {
            overwrite: true
        }

        logger.await("Construct processors", id)
        const processors = [
            ModpackDownloader,
            ModpackUnpacker,
            LauncherDownloader,
            LauncherUnpacker,
            ForgeDownloader,
            ForgeUnpacker,
            VanillaManifestDownloader,
            ForgeManifestCopier
        ].map(e => new e(id, config, options))

        logger.await("Run multiple", id)
        ProcessEventEmitter.runMultiple(processors, p => sendUpdate(p))
            .then(() => event.reply("modpack_success", id))
            .catch(e => reportError(e))
    }

    static async remove(id: string, event: IpcMainEvent) {
        const installDir = MainGlobals.getInstallDir();
        const instanceDir = Globals.getInstancePathById(installDir, id);

        logger.await("Removing modpack", id, "at path", instanceDir)
        fs.promises.rmdir(instanceDir, { recursive: true })
            .then(() => {
                logger.success("Removed modpack", id)
                event.reply("remove_modpack_success", id)
            })
            .catch(e => {
                logger.error("Failed to remove modpack", id, e)
                event.reply("remove_modpack_error", id, e)
            })
    }

    static addListeners() {
        ipcMain.on("install_modpack", (event, id) => {
            InstallManager.install(id, event);
        })

        ipcMain.on("update_modpack", (event, id) => {
            InstallManager.install(id, event, true)
        })

        ipcMain.on("remove_modpack", (event, id) => {
            InstallManager.remove(id, event);
        })
    }
}