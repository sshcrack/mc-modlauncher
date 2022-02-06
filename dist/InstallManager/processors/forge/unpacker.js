"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgeUnpacker = void 0;
const mainGlobals_1 = require("../../../Globals/mainGlobals");
const mcBase_1 = require("../../General/mcBase");
const Unpacker_1 = require("../base/Unpacker");
class ForgeUnpacker extends Unpacker_1.Unpacker {
    constructor(id, config, options) {
        super(id, config, Object.assign(Object.assign({}, options), { src: (0, mcBase_1.getForgeInstallerZip)(mainGlobals_1.MainGlobals.getInstallDir(), id, config), destination: (0, mcBase_1.getForgeDir)(mainGlobals_1.MainGlobals.getInstallDir(), id, config), messages: {
                extracting: "Extracting forge..."
            }, overwrite: true }));
        this.id = id;
        this.config = config;
    }
}
exports.ForgeUnpacker = ForgeUnpacker;
//# sourceMappingURL=unpacker.js.map