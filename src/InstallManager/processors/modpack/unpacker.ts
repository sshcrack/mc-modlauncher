import { Modpack } from "../../../interfaces/modpack";
import { AdditionalOptions } from '../../event/Processor';
import { Unpacker } from '../base/Unpacker';
import { getDestination, getInstallZip } from './file';

export class ModpackUnpacker extends Unpacker {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            src: getInstallZip(id, config),
            destination: getDestination(id),
            messages: {
                extracting: "Extracting modpack..."
            }
        });
    }
}