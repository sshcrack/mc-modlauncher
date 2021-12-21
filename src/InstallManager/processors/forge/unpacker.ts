import { Modpack } from '../../../interfaces/modpack';
import { AdditionalOptions } from '../../event/Processor';
import { Unpacker } from '../base/Unpacker';
import { getForgeJar, getForgeDir } from './file';

export class ForgeUnpacker extends Unpacker {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            src: getForgeJar(id, config),
            destination: getForgeDir(id, config),
            messages: {
                extracting: "Extracting forge..."
            },
            overwrite: true
        });

        this.id = id;
        this.config = config;
    }
}