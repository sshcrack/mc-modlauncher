import { MainGlobals } from '../../../Globals/mainGlobals';
import { Modpack } from "../../../interfaces/modpack";
import { AdditionalOptions } from '../../event/Processor';
import { getInstallZip } from '../../General/mcBase';
import { Unpacker } from '../base/Unpacker';
import { getInstanceDestination } from './file';

export class ModpackUnpacker extends Unpacker {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, {
            ...options,
            src: getInstallZip(MainGlobals.getInstallDir(), id, config),
            destination: getInstanceDestination(id),
            deleteExistent: true,
            messages: {
                extracting: "Extracting modpack..."
            }
        });
    }
}