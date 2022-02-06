import { store } from '../pages/preferences/main';
import path from "path"
import fs from "fs"

export class MainGlobals {
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
}