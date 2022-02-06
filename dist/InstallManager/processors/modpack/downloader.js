"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModpackDownloader = void 0;
const mainGlobals_1 = require("../../../Globals/mainGlobals");
const mcBase_1 = require("../../General/mcBase");
const Downloader_1 = require("../base/Downloader");
const file_1 = require("./file");
class ModpackDownloader extends Downloader_1.Downloader {
    constructor(id, config, options) {
        super(id, config, Object.assign(Object.assign({}, options), { destination: (0, mcBase_1.getInstallZip)(mainGlobals_1.MainGlobals.getInstallDir(), id, config), url: (0, file_1.getUrl)(id, config), messages: {
                downloading: "Downloading modpack..."
            } }));
        this.id = id;
        this.config = config;
    }
}
exports.ModpackDownloader = ModpackDownloader;
//# sourceMappingURL=downloader.js.map