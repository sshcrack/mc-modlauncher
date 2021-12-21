import { Modpack } from '../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { Downloader } from '../base/Downloader';
import { getForgeJar, getUrl } from './file';



export class ForgeDownloader extends Downloader {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            destination: getForgeJar(id, config),
            url: getUrl(id, config),
            messages: {
                downloading: "Downloading forge..."
            }
        });

        this.id = id;
        this.config = config;
    }
}