import { Modpack } from '../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { Downloader } from '../base/Downloader';
import { getInstallZip, getUrl } from './file';



export class ModpackDownloader extends Downloader {
    constructor (id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            destination: getInstallZip(id, config),
            url: getUrl(id, config),
            messages: {
                downloading: "Downloading modpack..."
            }
        });

        this.id = id;
        this.config = config;
    }
}