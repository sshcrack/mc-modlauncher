import { Globals } from '.';
import { ModpackInfo } from '../interfaces/modpack';
import { RenderLogger } from '../interfaces/renderLogger';

const logger = RenderLogger.get("Globals", "renderGlobals")
const { preferences, modpack } = window.api
export class RenderGlobals {
    static getInstallDir(): string {
        return preferences.get("install_dir") as string;
    }

    static hasLatest(id: string, config: ModpackInfo) {
        if(!config?.versions ||!id)
            return undefined;

        const currently = modpack.version(id)
        const latest = Globals.getLastVersion(config);

        logger.debug("Has Latest for id", id, "Currently", currently?.id, "Latest", latest?.id)
        return currently?.id === latest?.id;
    }
}