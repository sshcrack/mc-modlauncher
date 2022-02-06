"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LauncherDownloader = void 0;
const Globals_1 = require("../../../Globals");
const Downloader_1 = require("../base/Downloader");
const file_1 = require("./file");
const baseUrl = Globals_1.Globals.baseUrl;
class LauncherDownloader extends Downloader_1.Downloader {
    constructor(id, config, options) {
        super(id, config, Object.assign(Object.assign({}, options), { destination: (0, file_1.getLauncherZip)(), url: `${baseUrl}/launcher.zip`, messages: {
                downloading: "Downloading launcher..."
            }, overwrite: false }));
        this.id = id;
        this.config = config;
    }
}
exports.LauncherDownloader = LauncherDownloader;
//# sourceMappingURL=downloader.js.map