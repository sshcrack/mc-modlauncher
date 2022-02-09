import { Globals } from '../../../../Globals';
import { ModpackInfo } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { Downloader } from '../base/Downloader';
import { getLauncherZip } from './file';

const baseUrl = Globals.baseUrl;

export class LauncherDownloader extends Downloader {
    constructor(id: string, config: ModpackInfo, options: AdditionalOptions) {
        super(id, config, {
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