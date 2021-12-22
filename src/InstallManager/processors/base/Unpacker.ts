import fs from "fs";
import unpacker from "unpacker-with-progress";
import JSZip from "jszip"
import { Logger } from '../../../interfaces/logger';
import { Modpack } from "../../../interfaces/modpack";
import { AdditionalOptions, ProcessEventEmitter } from '../../event/Processor';
import path from 'path';


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

        const file = fs.readFileSync(src)

        const zip = new JSZip()
        await zip.loadAsync(file)

        const files = Object.values(zip.files)
            .map(e => e.name)
            .map(e => path.dirname(e))

        files.forEach(e => {
            const exist = fs.existsSync(e);
            if(exist)
                fs.rmSync(e, { recursive: true, force: true})
        })

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
    deleteExistent?: boolean,
    messages: {
        /** Extracting modpack... => Extracting modpack... (5/10) */
        extracting: string
    }
}