"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.McJarDownloader = void 0;
const Downloader_1 = require("../../base/Downloader");
const mcBase_1 = require("../../../General/mcBase");
const file_1 = require("./file");
class McJarDownloader extends Downloader_1.Downloader {
    constructor(id, config, options) {
        super(id, config, Object.assign(Object.assign({}, options), { 
            //TODO add validation
            destination: () => (0, mcBase_1.getVersionJar)(config.mcVersion), url: () => (0, file_1.getMinecraftClientUrl)(config.mcVersion), messages: {
                downloading: "Downloading vanilla jar..."
            } }));
        this.id = id;
        this.config = config;
    }
}
exports.McJarDownloader = McJarDownloader;
//# sourceMappingURL=mcJarDownloader.js.map