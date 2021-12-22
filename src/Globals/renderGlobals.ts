import { ipcRenderer } from 'electron';
import { Globals } from '.';
import { Modpack } from '../interfaces/modpack';

export class RenderGlobals {
    static getInstallDir(): string {
        return ipcRenderer.sendSync("get_pref", "install_dir")
    }

    static hasLatest(id: string, config: Modpack) {
        const currently = ipcRenderer.sendSync("get_version", id);
        const latest = Globals.getLastVersion(config);

        console.log("Has Latest for id", id, "Currently", currently?.id, "Latest", latest?.id)
        return currently?.id === latest?.id;
    }
}