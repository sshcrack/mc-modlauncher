import fs from "fs";
import got from "got";
import path from "path";
import { Modpack } from '../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { VersionManifest } from '../interface';
import { getVersionsDir } from './file';


export class VanillaManifestDownloader extends ProcessEventEmitter {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, options);

        this.id = id;
        this.config = config;
    }

    public async run() {
        this.emit("progress", { percent: 0, status: "Downloading vanilla manifest..." });
        const { version } = this.config;

        const versionsDir = getVersionsDir();
        const currVersion = path.join(versionsDir, version);

        if (!fs.existsSync(currVersion))
            fs.mkdirSync(currVersion, { recursive: true})


        const manifestUrl = `https://launchermeta.mojang.com/mc/game/version_manifest.json`;
        const res = await got(manifestUrl);

        const { versions }: VersionManifest = JSON.parse(res.body);
        const curr = versions.find(v => v.id === version);

        this.emit("progress", { percent: 50, status: "Writing to disk..." });
        if(!curr)
            throw `Version ${version} could not be found.`;

        const versionFile = path.join(currVersion, `${version}.json`);
        fs.writeFileSync(versionFile, JSON.stringify(curr));
    }
}