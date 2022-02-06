"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Downloader = void 0;
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../../interfaces/logger");
const Processor_1 = require("../../event/Processor");
const logger = logger_1.Logger.get("InstallManager", "base", "Downloader");
class Downloader extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options) {
        super(id, config, options);
        this.id = id;
        this.config = config;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { url: urlGetter, destination: destGetter, messages, overwrite, sha } = this.options;
            const url = typeof urlGetter === "string" ? urlGetter : urlGetter();
            const destination = typeof destGetter === "string" ? destGetter : destGetter();
            logger.info(messages.downloading);
            if (!overwrite && fs_1.default.existsSync(destination)) {
                logger.info(`File ${destination} already exists. Skipping download.`);
                this.emit("progress", { percent: 100, status: "File already exists. Skipping." });
                return;
            }
            const dirName = path_1.default.dirname(destination);
            if (!fs_1.default.existsSync(dirName))
                fs_1.default.mkdirSync(dirName, { recursive: true });
            logger.info(`Downloading ${url} to ${destination}`);
            let writeStream;
            const generateDownload = (retryStream) => {
                return new Promise(resolve => {
                    const stream = retryStream !== null && retryStream !== void 0 ? retryStream : got.stream(url);
                    if (writeStream)
                        writeStream.destroy();
                    writeStream = fs_1.default.createWriteStream(destination);
                    stream.pipe(writeStream);
                    stream.once("retry", (_, _1, createReadStream) => {
                        logger.warn("Connection aborted, retrying...");
                        generateDownload(createReadStream());
                    });
                    stream.on("downloadProgress", (prog) => {
                        this.emit("progress", {
                            status: messages.downloading,
                            percent: prog.percent,
                        });
                    });
                    stream.once("end", () => resolve());
                });
            };
            yield generateDownload(null);
            if (!sha)
                return;
            logger.info("Validating file using sha1 (and creating read stream)");
            //TODO add this to top function
            const readStream = fs_1.default.createReadStream(destination);
            const digest = crypto_1.default.createHash('sha1');
            digest.setEncoding("hex");
            logger.debug("Piping digest");
            readStream.pipe(digest);
            yield new Promise(resolve => {
                readStream.on("end", () => resolve());
            });
            digest.end();
            const fileSha = digest.read();
            logger.debug("File-SHA:", destination, "Expected:", sha, "Same:", fileSha === sha);
            if (fileSha === sha)
                return;
            throw new Error(`File ${destination} has incorrect sha file sha: ${fileSha} expected: ${sha}`);
        });
    }
}
exports.Downloader = Downloader;
//# sourceMappingURL=Downloader.js.map