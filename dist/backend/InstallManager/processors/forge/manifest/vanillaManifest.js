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
exports.VanillaManifestDownloader = void 0;
const fs_1 = __importDefault(require("fs"));
const got_1 = __importDefault(require("got"));
const path_1 = __importDefault(require("path"));
const Processor_1 = require("../../../event/Processor");
const mcBase_1 = require("../../../General/mcBase");
class VanillaManifestDownloader extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options) {
        super(id, config, options);
        this.id = id;
        this.config = config;
    }
    run() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            this.emit("progress", { percent: 0, status: "Downloading vanilla manifest..." });
            const { mcVersion: version } = this.config;
            const versionsDir = (0, mcBase_1.getVersionsDir)();
            //.minecraft/1.18.1
            const currVersion = path_1.default.join(versionsDir, version);
            //.minecraft/1.18.1/1.18.1.json
            const versionFile = path_1.default.join(currVersion, `${version}.json`);
            if (!fs_1.default.existsSync(currVersion))
                fs_1.default.mkdirSync(currVersion, { recursive: true });
            const manifestUrl = `https://launchermeta.mojang.com/mc/game/version_manifest.json`;
            const res = yield (0, got_1.default)(manifestUrl);
            const { versions } = JSON.parse(res.body);
            const { url } = (_a = versions.find(v => v.id === version)) !== null && _a !== void 0 ? _a : {};
            if (!url)
                throw new Error(`Version ${version} could not be found.`);
            const fullManifest = yield (0, got_1.default)(url);
            this.emit("progress", { percent: 50, status: "Writing to disk..." });
            fs_1.default.writeFileSync(versionFile, fullManifest.body);
        });
    }
}
exports.VanillaManifestDownloader = VanillaManifestDownloader;
//# sourceMappingURL=vanillaManifest.js.map