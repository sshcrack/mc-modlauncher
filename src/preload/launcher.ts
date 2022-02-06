import { Modpack } from '../interfaces/modpack';
import { ipcRenderer } from 'electron';

export const launcher = {
    launch:  async (id: string, config: Modpack) => {
        return new Promise<void>(resolve => {
            ipcRenderer.once("launched_mc_success", () => resolve())
            ipcRenderer.send("launch_mc", id, config)
        });
    }
}