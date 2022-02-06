"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LauncherUnpacker = void 0;
const Unpacker_1 = require("../base/Unpacker");
const file_1 = require("./file");
class LauncherUnpacker extends Unpacker_1.Unpacker {
    constructor(id, config, options) {
        super(id, config, Object.assign(Object.assign({}, options), { src: (0, file_1.getLauncherZip)(), destination: (0, file_1.getLauncherDir)(), messages: {
                extracting: "Extracting launcher..."
            }, overwrite: false }));
        this.id = id;
        this.config = config;
    }
}
exports.LauncherUnpacker = LauncherUnpacker;
//# sourceMappingURL=unpacker.js.map