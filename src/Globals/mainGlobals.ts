import { store } from '../backend/preferences';
import path from "path"
import fs from "fs"
import { BrowserWindow, WebContents } from 'electron';
import { Progress } from '../backend/InstallManager/event/interface';

export class MainGlobals {
    static window: BrowserWindow;
    static lockInfo = {
        listeners: [] as WebContents[],
        locked: false,
        currProgress: undefined as Progress
    }

    static getInstallDir(): string {
        return store.get("install_dir")
    }

    static getTempDir(installDir: string, shouldDelete = false) {
        const tempPath = path.join(installDir, "temp");

        if (fs.existsSync(tempPath) && shouldDelete)
            fs.rmSync(tempPath, { recursive: true, force: true });


        if (!fs.existsSync(tempPath))
            fs.mkdirSync(tempPath);

        return tempPath;
    }

    static getInstanceDir(installDir: string) {
        return path.join(installDir, "Instances");
    }

    static getInstancePathById(installDir: string, id: string) {
        return path.join(this.getInstanceDir(installDir), id);
    }

    static getCreatingFile(installDir: string, id: string) {
        const dir = MainGlobals.getInstancePathById(installDir, id);
        return path.join(dir, ".creating")
    }

    static getModFolder(instances: string, id: string) {
        return path.join(instances, id, "mods")
    }
}