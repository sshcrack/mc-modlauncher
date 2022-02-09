import fs from "fs";
import path from "path";
import { MainGlobals } from '../../../../Globals/mainGlobals';
import { MainLogger } from '../../../../interfaces/mainLogger';
import { ModpackInfo } from '../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../event/Processor';
import { getForgeInstallProfile, getLibrariesDir, getVersionManifest } from '../../General/mcBase';
import { VersionManifest } from '../../General/versionManifest';
import { Downloader } from '../base/Downloader';
import { SharedMap } from '../interface';

const logger = MainLogger.get("InstallManager", "Processors", "LibrariesMultiple")
export class LibraryMultipleDownloader extends ProcessEventEmitter {
    private shared: SharedMap;

    constructor(id: string, config: ModpackInfo, options: AdditionalOptions, shared: SharedMap) {
        super(id, config, options);
        this.shared = shared;
    }

    public async run() {
        const { mcVersion } = this.config;
        const { forgeVersion } = this.shared;
        const installDir = MainGlobals.getInstallDir();

        if(!forgeVersion)
            throw new Error(`Library Multiple Downloader has no forgeVersion`)

        const installProfilePath = getForgeInstallProfile(installDir, this.id, this.config)
        const libraries = [ getVersionManifest(mcVersion), getVersionManifest(forgeVersion), installProfilePath ]
            .map(e => fs.readFileSync(e, "utf-8"))
            .map(e => JSON.parse(e) as VersionManifest)
            .map(e => e.libraries
                        .map(e => e.downloads.artifact)
            )
            .reduce((a, b) => a.concat(b), [])
            .concat()

        const librariesDir = getLibrariesDir();
        const downloaders = libraries
            .map<Downloader | undefined>(({ url, path: relativePath, sha1 }, i) => {
                if (!relativePath) {
                    logger.error(`Library ${url} has no path, skipping`)
                    return undefined;
                }

                const destination = path.join(librariesDir, relativePath)
                const libName = path.basename(relativePath, ".jar");

                return new Downloader(this.id, this.config, {
                    destination: destination,
                    url: url,
                    sha: sha1,
                    overwrite: false,
                    messages: {
                        downloading: `Downloading library ${libName} (${i}/${libraries.length})`
                    }
                })
            })
            .filter(e => e)

            await ProcessEventEmitter.runMultiple(downloaders, prog => {
                this.emit("progress", prog);
            })
    }
}