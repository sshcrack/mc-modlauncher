import crypto from "crypto";
import fs, { WriteStream } from 'fs';
import got from 'got/dist/source';
import Request, { Progress } from 'got/dist/source/core';
import path from "path";
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
        const { url: urlGetter, destination: destGetter, messages, overwrite, sha } = this.options
        const url = typeof urlGetter === "string" ? urlGetter : urlGetter();
        const destination = typeof destGetter === "string" ? destGetter : destGetter();

        logger.await(messages.downloading)


        if (!overwrite && fs.existsSync(destination)) {
            logger.info(`File ${destination} already exists. Skipping download.`)
            this.emit("progress", { percent: 100, status: "File already exists. Skipping." })
            return;
        }


        const dirName = path.dirname(destination)
        if (!fs.existsSync(dirName))
            fs.mkdirSync(dirName, { recursive: true })


        logger.info(`Downloading ${url} to ${destination}`)
        let writeStream: WriteStream
        const generateDownload = (retryStream: Request): Promise<void> => {
            return new Promise(resolve => {
                const stream =
                    retryStream ??
                    got.stream(url)

                if (writeStream)
                    writeStream.destroy()

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
        if(!sha)
            return;

        logger.await("Validating file using sha1 (and creating read stream)")
        //TODO add this to top function

        const readStream = fs.createReadStream(destination)
        const digest = crypto.createHash('sha1');
        digest.setEncoding("hex")

        logger.await("Piping digest")
        readStream.pipe(digest);
        await new Promise<void>(resolve => {
            readStream.on("end", () => resolve())
        });

        digest.end();
        const fileSha = digest.read();
        if(fileSha === sha)
            return;

        throw new Error(`File ${destination} has incorrect sha file sha: ${fileSha} expected: ${sha}`)
    }
}

export interface DownloaderOptions extends AdditionalOptions {
    url: string | (() => string),
    destination: string | (() => string),
    sha?: string;
    messages: {
        /**E.g. Downloading modpack... */
        downloading: string
    }
}