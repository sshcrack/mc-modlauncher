import { store } from '../backend/preferences';
import path from "path"
import os from "os"
import fs from "fs"
import { BrowserWindow, WebContents } from 'electron';
import { Progress } from '../backend/InstallManager/event/interface';
import { Globals } from '.';

export class MainGlobals {
    static window: BrowserWindow;
    static lockInfo = {
        listeners: [] as WebContents[],
        locked: false,
        currProgress: undefined as Progress,
        lockListeners: [] as (() => unknown)[]
    }
    
    static get javaDownloadUrl(): string {
        const linuxUrl = "https://javadl.oracle.com/webapps/download/AutoDL?BundleId=245797_df5ad55fdd604472a86a45a217032c7d"
        const windowsUrl = "https://javadl.oracle.com/webapps/download/AutoDL?BundleId=245807_df5ad55fdd604472a86a45a217032c7d"
    
        return this.getOS() === "Windows_NT" ? windowsUrl : linuxUrl
    }

    
    static get launcherDownloadUrl(): string {
        const linuxUrl = "https://launcher.mojang.com/download/Minecraft.tar.gz"
        const windowsUrl = "https://launcher.mojang.com/download/MinecraftInstaller.msi"

        return this.getOS() === "Windows_NT" ? windowsUrl : linuxUrl
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

    static getOS() {
        return os.type() as "Linux" | "Windows_NT" | "Darwin"
    }
}