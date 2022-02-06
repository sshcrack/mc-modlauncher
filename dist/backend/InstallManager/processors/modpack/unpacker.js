"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModpackUnpacker = void 0;
const mainGlobals_1 = require("../../../../Globals/mainGlobals");
const mcBase_1 = require("../../General/mcBase");
const Unpacker_1 = require("../base/Unpacker");
const file_1 = require("./file");
class ModpackUnpacker extends Unpacker_1.Unpacker {
    constructor(id, config, options) {
        super(id, config, Object.assign(Object.assign({}, options), { src: (0, mcBase_1.getInstallZip)(mainGlobals_1.MainGlobals.getInstallDir(), id, config), destination: (0, file_1.getInstanceDestination)(id), deleteExistent: true, messages: {
                extracting: "Extracting modpack..."
            } }));
    }
}
exports.ModpackUnpacker = ModpackUnpacker;
//# sourceMappingURL=unpacker.js.map