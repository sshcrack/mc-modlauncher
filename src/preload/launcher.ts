import { ModpackInfo } from '../interfaces/modpack';
import { ipcRenderer } from 'electron';

export const launcher = {
    launch:  async (id: string, config: ModpackInfo) => {
        return new Promise<void>((resolve, reject) => {
            ipcRenderer.once("launched_mc_success", () => resolve())
            ipcRenderer.once("launched_mc_error", (_, e) => reject(e))
            ipcRenderer.send("launch_mc", id, config)
        });
    }
}