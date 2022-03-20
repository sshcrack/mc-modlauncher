import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { getForgeInstallerZip } from '../../General/mcBase';
import { Downloader } from '../base/Downloader';
import { getForgeUrl } from './file';



export class ForgeDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            destination: getForgeInstallerZip(MainGlobals.getInstallDir(), id, version),
            url: getForgeUrl(id, version),
            messages: {
                downloading: "Downloading forge..."
            }
        });

        this.id = id;
        this.config = config;
    }
}