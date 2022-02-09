import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo, Version } from "../../../../interfaces/modpack";
import { AdditionalOptions } from '../../event/Processor';
import { getInstallZip } from '../../General/mcBase';
import { Unpacker } from '../base/Unpacker';
import { getInstanceDestination } from './file';

export class ModpackUnpacker extends Unpacker {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, {
            ...options,
            src: getInstallZip(MainGlobals.getInstallDir(), id, version),
            destination: getInstanceDestination(id),
            deleteExistent: true,
            messages: {
                extracting: "Extracting modpack..."
            }
        });
    }
}