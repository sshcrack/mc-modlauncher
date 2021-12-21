import fs, { WriteStream } from 'fs';
import got from 'got/dist/source';
import Request, { Progress } from 'got/dist/source/core';
import { Globals } from '../../../Globals';
import { RenderGlobals } from '../../../Globals/renderGlobals';
import { Logger } from '../../../interfaces/logger';
import { Modpack } from '../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../event/Processor';


const logger = Logger.get("InstallManager", "processors", "Downloader")
const baseUrl = Globals.baseUrl;

export class Downloader extends ProcessEventEmitter {
    private instanceUrl: string;

    constructor (id: string, config: Modpack, options: AdditionalOptions) {
        super(id, config, options);

        this.id = id;
        this.config = config;

        this.instanceUrl = `${baseUrl}/${this.id}`
    }

    public async run() {
        logger.await("Downloading modpack from")
        this.emit("progress", { percent: 0, status: "Starting download..."})

        const installDir = RenderGlobals.getInstallDir();
        const installZip = Globals.getInstallZip(installDir)

        const { versions } = this.config

        const last = versions.length -1
        const { file: fileName } = versions[last]

        let writeStream: WriteStream
        const generateDownload = (retryStream: Request): Promise<void> => {
            return new Promise(resolve => {
                logger.await("Establishing stream")
                const stream =
                    retryStream ??
                    got.stream(`${this.instanceUrl}/${fileName}`)

                if (writeStream)
                    writeStream.destroy()

                logger.await("Creating Write Stream")
                writeStream = fs.createWriteStream(installZip);

                stream.pipe(writeStream)

                stream.once("retry", (_, _1, createReadStream) => {
                    logger.warn("Connection aborted, retrying...")
                    generateDownload(createReadStream());
                })

                stream.on("downloadProgress", (prog: Progress) => {
                    this.emit("progress", {
                        status: "Downloading modpack...",
                        percent: prog.percent,
                    })
                })

                stream.once("end", () => resolve());
            });
        }

        await generateDownload(null);
    }
}