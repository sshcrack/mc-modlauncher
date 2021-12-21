import fs, { WriteStream } from 'fs';
import got from 'got/dist/source';
import Request, { Progress } from 'got/dist/source/core';
import { Logger } from '../../../interfaces/logger';
import { Modpack } from '../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../event/Processor';


const logger = Logger.get("InstallManager", "base", "Downloader")
export class Downloader extends ProcessEventEmitter {
    public options: DownloaderOptions;

    constructor(id: string, config: Modpack, options: DownloaderOptions) {
        super(id, config, options);

        this.id = id;
        this.config = config;
    }

    public async run() {
        const { url, destination, messages, overwrite } = this.options
        logger.await(messages.downloading)
        this.emit("progress", { percent: 0, status: "Starting download..." })

        if(!overwrite && fs.existsSync(destination)) {
            logger.info(`File ${destination} already exists. Skipping download.`)
            this.emit("progress", { percent: 100, status: "File already exists. Skipping." })
            return;
        }

        let writeStream: WriteStream
        const generateDownload = (retryStream: Request): Promise<void> => {
            return new Promise(resolve => {
                logger.await("Establishing stream")
                const stream =
                    retryStream ??
                    got.stream(url)

                if (writeStream)
                    writeStream.destroy()

                logger.await("Creating Write Stream")
                writeStream = fs.createWriteStream(destination);

                stream.pipe(writeStream)

                stream.once("retry", (_, _1, createReadStream) => {
                    logger.warn("Connection aborted, retrying...")
                    generateDownload(createReadStream());
                })

                stream.on("downloadProgress", (prog: Progress) => {
                    this.emit("progress", {
                        status: messages.downloading,
                        percent: prog.percent,
                    })
                })

                stream.once("end", () => resolve());
            });
        }

        await generateDownload(null);
    }
}

export interface DownloaderOptions extends AdditionalOptions {
    url: string,
    destination: string,
    messages: {
        /**E.g. Downloading modpack... */
        downloading: string
    }
}