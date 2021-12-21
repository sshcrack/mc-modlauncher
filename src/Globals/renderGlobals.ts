import { ipcRenderer } from 'electron';

export class RenderGlobals {
    static getInstallDir(): string {
        return ipcRenderer.sendSync("get_pref", "install_dir")
    }
}