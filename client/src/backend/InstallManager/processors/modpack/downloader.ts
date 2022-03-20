import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { getInstallZip } from '../../General/mcBase';
import { Downloader } from '../base/Downloader';
import { getUrl } from './file';



export class ModpackDownloader extends Downloader {
    constructor (id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            destination: getInstallZip(MainGlobals.getInstallDir(), id, version),
            url: getUrl(id, version),
            messages: {
                downloading: "Downloading modpack..."
            }
        });

        this.id = id;
        this.config = config;
    }
}