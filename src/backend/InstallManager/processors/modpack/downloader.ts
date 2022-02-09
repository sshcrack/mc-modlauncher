import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { getInstallZip } from '../../General/mcBase';
import { Downloader } from '../base/Downloader';
import { getUrl } from './file';



export class ModpackDownloader extends Downloader {
    constructor (id: string, config: ModpackInfo, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            destination: getInstallZip(MainGlobals.getInstallDir(),id, config),
            url: getUrl(id, config),
            messages: {
                downloading: "Downloading modpack..."
            }
        });

        this.id = id;
        this.config = config;
    }
}