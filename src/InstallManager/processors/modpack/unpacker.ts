import unpacker from "unpacker-with-progress";
import { Globals } from '../../../Globals';
import { RenderGlobals } from '../../../Globals/renderGlobals';
import { Logger } from '../../../interfaces/logger';
import { AdditionalOptions, ProcessEventEmitter } from '../../event/Processor';
import { Modpack } from "../../../interfaces/modpack";


const logger = Logger.get("InstallManager", "processors", "Unpacker")

export class Unpacker extends ProcessEventEmitter {
    constructor(id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, options);
    }

    public async run() {
        logger.await("Downloading modpack from")
        this.emit("progress", { percent: 0, status: "Extracting modpack..." })

        const installDir = RenderGlobals.getInstallDir()
        const instanceDir = Globals.getInstancePathById(installDir, this.id)
        const installZip = Globals.getInstallZip(installDir)
        const { overwrite } = this.options;

        await unpacker(installZip, instanceDir, {
            resume: overwrite,
            onprogress: stats =>
                this.emit("progress", {
                    percent: stats.percent,
                    status: `Extracting modpack... ${stats.unpacked} / ${stats.totalEntries}`
                })
        })
    }
}