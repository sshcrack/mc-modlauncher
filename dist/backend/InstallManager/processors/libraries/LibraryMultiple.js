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
exports.LibraryMultipleDownloader = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mainGlobals_1 = require("../../../../Globals/mainGlobals");
const mainLogger_1 = require("../../../../interfaces/mainLogger");
const Processor_1 = require("../../event/Processor");
const mcBase_1 = require("../../General/mcBase");
const Downloader_1 = require("../base/Downloader");
const logger = mainLogger_1.MainLogger.get("InstallManager", "Processors", "LibrariesMultiple");
class LibraryMultipleDownloader extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options, shared) {
        super(id, config, options);
        this.shared = shared;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { mcVersion } = this.config;
            const { forgeVersion } = this.shared;
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            if (!forgeVersion)
                throw new Error(`Library Multiple Downloader has no forgeVersion`);
            const installProfilePath = (0, mcBase_1.getForgeInstallProfile)(installDir, this.id, this.config);
            const libraries = [(0, mcBase_1.getVersionManifest)(mcVersion), (0, mcBase_1.getVersionManifest)(forgeVersion), installProfilePath]
                .map(e => fs_1.default.readFileSync(e, "utf-8"))
                .map(e => JSON.parse(e))
                .map(e => e.libraries
                .map(e => e.downloads.artifact))
                .reduce((a, b) => a.concat(b), [])
                .concat();
            const librariesDir = (0, mcBase_1.getLibrariesDir)();
            const downloaders = libraries
                .map(({ url, path: relativePath, sha1 }, i) => {
                if (!relativePath) {
                    logger.error(`Library ${url} has no path, skipping`);
                    return undefined;
                }
                const destination = path_1.default.join(librariesDir, relativePath);
                const libName = path_1.default.basename(relativePath, ".jar");
                return new Downloader_1.Downloader(this.id, this.config, {
                    destination: destination,
                    url: url,
                    sha: sha1,
                    overwrite: false,
                    messages: {
                        downloading: `Downloading library ${libName} (${i}/${libraries.length})`
                    }
                });
            })
                .filter(e => e);
            yield Processor_1.ProcessEventEmitter.runMultiple(downloaders, prog => {
                this.emit("progress", prog);
            });
        });
    }
}
exports.LibraryMultipleDownloader = LibraryMultipleDownloader;
//# sourceMappingURL=LibraryMultiple.js.map