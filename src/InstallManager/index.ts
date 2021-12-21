import { ipcMain, IpcMainEvent } from 'electron';
import fs from "fs";
import got from "got";
import { RenderGlobals } from '../Globals/renderGlobals';
import { Globals } from "../Globals";
import { Modpack } from '../interfaces/modpack';
import { getInstalled } from '../preload/instance';
import { Progress } from './event/interface';
import { AdditionalOptions, ProcessEventEmitter } from './event/Processor';
import { Downloader } from './processors/modpack/downloader';
import { Unpacker } from './processors/modpack/unpacker';

const baseUrl = Globals.baseUrl;
export class InstallManager {
    private static async getConfig(id: string) {
        const configRes = await got(`${baseUrl}/${id}/config.json`)

        if (!configRes)
            return;

        return JSON.parse(configRes.body) as Modpack;
    }

    static async install(id: string, event: IpcMainEvent, overwrite = false) {
        const installDir = RenderGlobals.getInstallDir();
        const installations = getInstalled();
        const instanceDir = Globals.getInstancePathById(installDir, id);

        const sendUpdate = ({percent, status}: Progress) =>
            event.reply("modpack_update", id, percent, status)

        const reportError = (err: string) => {
            fs.rmSync(instanceDir, { recursive: true });
            event.reply("modpack_error", id, err);
        }



        if (!fs.existsSync(instanceDir))
            fs.mkdirSync(instanceDir);

        if (installations.includes(id) && !overwrite)
            return reportError("Modpack already installed.")

        const config = await InstallManager.getConfig(id)
            .catch(e => reportError(e));

        if (!config)
            return;

        const options: AdditionalOptions = {
            overwrite: true
        }

        const processors = [
            Downloader,
            Unpacker
        ].map(e => new e(id, config, options))

        ProcessEventEmitter.runMultiple(processors, sendUpdate)
            .then(() => event.reply("install_modpack_success", id))
            .catch(e => reportError(e))
    }

    static addListeners() {
        ipcMain.on("install_modpack", (event, id) => {
            InstallManager.install(id, event);
        })

        ipcMain.on("update_modpack", (event, id) => {
            InstallManager.install(id, event, true)
        })
    }
}