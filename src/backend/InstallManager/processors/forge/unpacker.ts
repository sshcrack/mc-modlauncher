import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo } from '../../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { getForgeDir, getForgeInstallerZip } from '../../General/mcBase';
import { Unpacker } from '../base/Unpacker';

export class ForgeUnpacker extends Unpacker {
    constructor(id: string, config: ModpackInfo, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            src: getForgeInstallerZip(MainGlobals.getInstallDir(),id, config),
            destination: getForgeDir(MainGlobals.getInstallDir(), id, config),
            messages: {
                extracting: "Extracting forge..."
            },
            overwrite: true
        });

        this.id = id;
        this.config = config;
    }
}