"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeDownloader = void 0;
const mainGlobals_1 = require("../../../../Globals/mainGlobals");
const mcBase_1 = require("../../General/mcBase");
const Downloader_1 = require("../base/Downloader");
const file_1 = require("./file");
class ForgeDownloader extends Downloader_1.Downloader {
    constructor(id, config, options) {
        super(id, config, Object.assign(Object.assign({}, options), { destination: (0, mcBase_1.getForgeInstallerZip)(mainGlobals_1.MainGlobals.getInstallDir(), id, config), url: (0, file_1.getForgeUrl)(id, config), messages: {
                downloading: "Downloading forge..."
            } }));
        this.id = id;
        this.config = config;
    }
}
exports.ForgeDownloader = ForgeDownloader;
//# sourceMappingURL=downloader.js.map