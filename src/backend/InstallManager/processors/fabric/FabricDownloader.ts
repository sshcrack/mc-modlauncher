import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { getForgeInstallerZip } from '../../General/mcBase';
import { Downloader } from '../base/Downloader';
import { getFabricUrl } from './file';



export class FabricDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            destination: getForgeInstallerZip(MainGlobals.getInstallDir(), id, version),
            url: getFabricUrl(),
            overwrite: false,
            messages: {
                downloading: "Downloading fabric..."
            }
        });

        this.id = id;
        this.config = config;
    }
}