import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { getForgeDir, getForgeInstallerZip } from '../../General/mcBase';
import { Unpacker } from '../base/Unpacker';

export class ForgeUnpacker extends Unpacker {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            src: getForgeInstallerZip(MainGlobals.getInstallDir(), id, version),
            destination: getForgeDir(MainGlobals.getInstallDir(), id, version),
            messages: {
                extracting: "Extracting forge..."
            },
            overwrite: true
        });

        this.id = id;
        this.config = config;
    }
}