import fs from "fs";
import fsExtra from "fs-extra";
import path from "path";
import { MainGlobals } from '../../../../../Globals/mainGlobals';
import { MainLogger } from '../../../../../interfaces/mainLogger';
import { ModpackInfo, Version } from '../../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { getForgeDir, getLibrariesDir } from '../../../General/mcBase';
import { SharedMap } from '../../interface';


const logger = MainLogger.get('ForgeMavenCopier');
//!This sets forge_version in options, run before using forge_version
export class ForgeMavenCopier extends ProcessEventEmitter {
    private shared: SharedMap;
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions, sharedMap: SharedMap) {
        super(id, config, version, options);

        this.id = id;
        this.config = config;
        this.shared = sharedMap;
    }

    public async run() {
        this.emit("progress", { percent: 0, status: "Copying forge maven..." });
        const installDir = MainGlobals.getInstallDir();
        const forgeDir = getForgeDir(installDir, this.id, this.version);
        const mavenDir = path.join(forgeDir, "maven");

        const libraryDir = getLibrariesDir();

        logger.info("Copying from", mavenDir, "to", libraryDir)
        if(!fs.existsSync(mavenDir))
            return

        if(!fs.existsSync(libraryDir))
            fs.mkdirSync(libraryDir, { recursive: true })

        this.emit("progress", { percent: 50, status: "Writing to disk..." });

        await fsExtra.copy(mavenDir, libraryDir, { recursive: true });
        this.emit("progress", { percent: 1, status: "copied files"})
        this.emit("end")
    }
}