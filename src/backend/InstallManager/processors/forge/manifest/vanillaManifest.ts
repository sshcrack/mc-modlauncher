import fs from "fs";
import got from "got";
import path from "path";
import { Modpack } from '../../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { getVersionsDir } from '../../../General/mcBase';
import { LauncherMeta } from '../../../General/launcherMeta';


export class VanillaManifestDownloader extends ProcessEventEmitter {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, options);

        this.id = id;
        this.config = config;
    }

    public async run() {
        this.emit("progress", { percent: 0, status: "Downloading vanilla manifest..." });
        const { mcVersion: version } = this.config;

        const versionsDir = getVersionsDir();
        //.minecraft/1.18.1
        const currVersion = path.join(versionsDir, version);
        //.minecraft/1.18.1/1.18.1.json
        const versionFile = path.join(currVersion, `${version}.json`);

        if (!fs.existsSync(currVersion))
            fs.mkdirSync(currVersion, { recursive: true})


        const manifestUrl = `https://launchermeta.mojang.com/mc/game/version_manifest.json`;
        const res = await got(manifestUrl);

        const { versions }: LauncherMeta = JSON.parse(res.body);
        const { url } = versions.find(v => v.id === version) ?? {};
        if (!url)
            throw new Error(`Version ${version} could not be found.`);

        const fullManifest = await got(url);
        this.emit("progress", { percent: 50, status: "Writing to disk..." });

        fs.writeFileSync(versionFile, fullManifest.body);
    }
}