import { ModpackInfo } from '../../../../../interfaces/modpack';
import { AdditionalOptions } from '../../../event/Processor';
import { Downloader } from '../../base/Downloader';
import { getVersionJar } from '../../../General/mcBase';
import { getMinecraftClientUrl } from './file';



export class McJarDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            //TODO add validation
            destination: () => getVersionJar(config.mcVersion),
            url: () => getMinecraftClientUrl(config.mcVersion),
            messages: {
                downloading: "Downloading vanilla jar..."
            }
        });

        this.id = id;
        this.config = config;
    }
}