import fs from "fs";
import unpacker from "unpacker-with-progress";
import { Logger } from '../../../interfaces/logger';
import { Modpack } from "../../../interfaces/modpack";
import { AdditionalOptions, ProcessEventEmitter } from '../../event/Processor';


const logger = Logger.get("InstallManager", "processors", "Unpacker")

export class Unpacker extends ProcessEventEmitter {
    public options: UnpackerOptions;

    constructor(id: string, config: Modpack, options: UnpackerOptions) {
        super(id, config, options);

        this.options = options;
    }

    public async run() {
        logger.await("Downloading modpack from")
        this.emit("progress", { percent: 0, status: "Extracting modpack..." })

        const { destination, src, messages } = this.options;
        const { overwrite } = this.options;

        if(!fs.existsSync(destination))
            fs.mkdirSync(destination, { recursive: true})

        if(!fs.existsSync(src))
            throw new Error(`File ${src} does not exist. (Unpacker)`)

        await unpacker(src, destination, {
            resume: overwrite,
            onprogress: stats =>
                this.emit("progress", {
                    percent: stats.percent,
                    status: messages.extracting + ` (${stats.unpacked} / ${stats.totalEntries})`
                })
        })
    }
}

export interface UnpackerOptions extends AdditionalOptions {
    src: string,
    destination: string,
    messages: {
        /** Extracting modpack... => Extracting modpack... (5/10) */
        extracting: string
    }
}