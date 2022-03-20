import { ModpackInfo, Version } from '../../../../../interfaces/modpack';
import { AdditionalOptions } from '../../../event/Processor';
import { Downloader } from '../../base/Downloader';
import { getVersionJar } from '../../../General/mcBase';
import { getMinecraftClientUrl } from './file';



export class McJarDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            //TODO add validation
            destination: () => getVersionJar(version.mcVersion ?? config.mcVersion),
            url: () => getMinecraftClientUrl(version.mcVersion ?? config.mcVersion),
            messages: {
                downloading: "Downloading vanilla jar..."
            }
        });

        this.id = id;
        this.config = config;
    }
}