import { MainGlobals } from '../../../../../Globals/mainGlobals';
import fs from "fs";
import path from "path";
import { MainLogger } from '../../../../../interfaces/mainLogger';
import { Modpack } from '../../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { InstallProfile } from '../../../General/installProfile';
import { getForgeDir, getForgeInstallProfile, getVersionsDir } from '../../../General/mcBase';
import { SharedMap } from '../../interface';


const logger = MainLogger.get('ForgeManifestCopier');
//!This sets forge_version in options, run before using forge_version
export class ForgeManifestCopier extends ProcessEventEmitter {
    private shared: SharedMap;
    constructor(id: string, config: Modpack, options: AdditionalOptions, sharedMap: SharedMap) {
        super(id, config, options);

        this.id = id;
        this.config = config;
        this.shared = sharedMap;
    }

    public async run() {
        this.emit("progress", { percent: 0, status: "Copying forge version..." });
        const installDir = MainGlobals.getInstallDir();
        const forgeDir = getForgeDir(installDir, this.id, this.config);
        const installProfilePath = getForgeInstallProfile(installDir, this.id, this.config);

        logger.info("Reading", installProfilePath)
        const installProfile: InstallProfile = JSON.parse(fs.readFileSync(installProfilePath, "utf-8"));
        const { version: forgeVersion } = installProfile

        this.shared.forgeVersion = forgeVersion

        const versionsDir = getVersionsDir();
        //.minecraft/1.18.1-forge.../
        const currVersion = path.join(versionsDir, forgeVersion);
        //.minecraft/1.18.1-forge.../1.18.1-forge...
        const versionFile = path.join(currVersion, `${forgeVersion}.json`);

        if (!fs.existsSync(currVersion))
            fs.mkdirSync(currVersion, { recursive: true })


        this.emit("progress", { percent: 50, status: "Writing to disk..." });

        const forgeFile = path.join(forgeDir, `version.json`)
        await fs.promises.copyFile(forgeFile, versionFile);
    }
}