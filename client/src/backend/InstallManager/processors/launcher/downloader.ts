import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { Downloader } from '../base/Downloader';
import { getLauncherOutput } from './file';

export class LauncherDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            destination: getLauncherOutput(),
            url: MainGlobals.launcherDownloadUrl,
            messages: {
                downloading: "Downloading launcher..."
            },
            overwrite: false
        });

        this.id = id;
        this.config = config;
    }
}