import fs from "fs";
import path from 'path';
import { Modpack } from '../interfaces/modpack';

export class Globals {
    static baseUrl = "https://mc.sshbot.ddnss.de";

    static getInstanceDir(installDir: string) {
        return path.join(installDir, "Instances");
    }

    static getInstancePathById(installDir: string, id: string) {
        return path.join(this.getInstanceDir(installDir), id);
    }

    static getTempDir(installDir: string, shouldDelete = false) {
        const tempPath = path.join(installDir, "temp");

        if (fs.existsSync(tempPath) && shouldDelete)
            fs.rmSync(tempPath, { recursive: true, force: true });


        if (!fs.existsSync(tempPath))
            fs.mkdirSync(tempPath);

        return tempPath;
    }

    static getLastVersion(config: Modpack) {
        const { versions } = config;

        const last = versions.length - 1
        const lastItem = versions[last];

        return lastItem
    }
}