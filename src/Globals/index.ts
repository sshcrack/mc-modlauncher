import fs from "fs"
import path from 'path';

export class Globals {
    static baseUrl = "https://mc.sshbot.ddnss.de";

    static getInstanceDir(installDir: string) {
        return path.join(installDir, "Instances");
    }

    static getInstancePathById(installDir: string, id: string) {
        return path.join(installDir, id);
    }

    static getTempDir(installDir: string, shouldDelete = false) {
        const tempPath = path.join(installDir, "temp");

        if (shouldDelete) {
            if (fs.existsSync(tempPath))
                fs.rmSync(tempPath, { recursive: true });

            fs.mkdirSync(tempPath);
        }

        return tempPath;
    }

    static getInstallZip(installDir: string) {
        return path.join(this.getTempDir(installDir), "install.zip")
    }
}