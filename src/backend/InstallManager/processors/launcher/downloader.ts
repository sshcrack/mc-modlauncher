import { Globals } from '../../../../Globals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { Downloader } from '../base/Downloader';
import { getLauncherZip } from './file';

const baseUrl = Globals.baseUrl;

export class LauncherDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            destination: getLauncherZip(),
            url: `${baseUrl}/launcher.zip`,
            messages: {
                downloading: "Downloading launcher..."
            },
            overwrite: false
        });

        this.id = id;
        this.config = config;
    }
}