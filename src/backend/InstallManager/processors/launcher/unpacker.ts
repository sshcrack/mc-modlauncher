import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { Unpacker } from '../base/Unpacker';
import { getLauncherDir, getLauncherZip } from './file';

export class LauncherUnpacker extends Unpacker {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            src: getLauncherZip(),
            destination: getLauncherDir(),
            messages: {
                extracting: "Extracting launcher..."
            },
            overwrite: false
        });

        this.id = id;
        this.config = config;
    }
}