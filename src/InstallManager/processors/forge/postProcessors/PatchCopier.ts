import { getVersionJar } from '../../../General/mcBase';
import { Modpack } from '../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { SharedProcessor } from './interface';
import fs from "fs"

export class PatchCopier extends ProcessEventEmitter {
    private shared: SharedProcessor;

    constructor(id: string, config: Modpack, options: AdditionalOptions, shared: SharedProcessor) {
        super(id, config, options);
        this.shared = shared;
    }

    public async run() {
        const { argumentData, forgeVersion } = this.shared

        const patchedPath = argumentData.get("PATCHED")
        const jarPath = getVersionJar(forgeVersion)

        this.emit("progress", { percent: 0, status: "Copying patched client..." })
        await fs.promises.copyFile(patchedPath, jarPath)
    }
}