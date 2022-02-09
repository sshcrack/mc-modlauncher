import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { getForgeInstallerZip } from '../../General/mcBase';
import { Downloader } from '../base/Downloader';
import { getForgeUrl } from './file';



export class ForgeDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            destination: getForgeInstallerZip(MainGlobals.getInstallDir(), id, config),
            url: getForgeUrl(id, config),
            messages: {
                downloading: "Downloading forge..."
            }
        });

        this.id = id;
        this.config = config;
    }
}