import fs from "fs";
import path from "path";
import { Logger } from '../../../../interfaces/logger';
import { Modpack } from '../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { getForgeDir } from '../file';
import { getVersionsDir } from './file';
import { InstallProfile } from './interface';


const logger = Logger.get('ForgeManifest');
export class ForgeManifestCopier extends ProcessEventEmitter {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, options);

        this.id = id;
        this.config = config;
    }

    public async run() {
        this.emit("progress", { percent: 0, status: "Copying forge version..." });
        const forgeDir = getForgeDir(this.id, this.config);

        const installProfilePath = path.join(forgeDir, "install_profile.json");

        logger.info("Reading", installProfilePath)
        const installProfile: InstallProfile = JSON.parse(fs.readFileSync(installProfilePath, "utf-8"));
        const { version } = installProfile

        const versionsDir = getVersionsDir();
        const currVersion = path.join(versionsDir, version);

        if (!fs.existsSync(currVersion))
            fs.mkdirSync(currVersion, { recursive: true })


        this.emit("progress", { percent: 50, status: "Writing to disk..." });

        const forgeVersion = path.join(forgeDir, "version.json")

        const versionFile = path.join(currVersion, `${version}.json`);
        await fs.promises.copyFile(forgeVersion, versionFile);
    }
}