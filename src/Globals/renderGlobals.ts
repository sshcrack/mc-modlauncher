import { Logger } from '../interfaces/logger';
import { ipcRenderer } from 'electron';
import { Globals } from '.';
import { Modpack } from '../interfaces/modpack';

const logger = Logger.get("Globals", "renderGlobals")
export class RenderGlobals {
    static getInstallDir(): string {
        return ipcRenderer.sendSync("get_pref", "install_dir")
    }

    static hasLatest(id: string, config: Modpack) {
        const currently = ipcRenderer.sendSync("get_version", id);
        const latest = Globals.getLastVersion(config);

        logger.debug("Has Latest for id", id, "Currently", currently?.id, "Latest", latest?.id)
        return currently?.id === latest?.id;
    }
}