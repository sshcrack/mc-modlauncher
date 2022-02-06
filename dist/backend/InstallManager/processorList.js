"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcessors = void 0;
const Globals_1 = require("../../Globals");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mcBase_1 = require("./General/mcBase");
const downloader_1 = require("./processors/forge/downloader");
const mcJarDownloader_1 = require("./processors/forge/jar/mcJarDownloader");
const forgeManifest_1 = require("./processors/forge/manifest/forgeManifest");
const vanillaManifest_1 = require("./processors/forge/manifest/vanillaManifest");
const PostProcessor_1 = require("./processors/forge/postProcessors/PostProcessor");
const unpacker_1 = require("./processors/forge/unpacker");
const assetCopier_1 = require("./processors/launcher/assetCopier");
const downloader_2 = require("./processors/launcher/downloader");
const file_1 = require("./processors/launcher/file");
const unpacker_2 = require("./processors/launcher/unpacker");
const LibraryMultiple_1 = require("./processors/libraries/LibraryMultiple");
const downloader_3 = require("./processors/modpack/downloader");
const unpacker_3 = require("./processors/modpack/unpacker");
const mainLogger_1 = require("../../interfaces/mainLogger");
const logger = mainLogger_1.MainLogger.get("InstallManager", "ProcessorList");
function getProcessors(id, config, overwrite) {
    const lastVer = Globals_1.Globals.getLastVersion(config);
    const { forge_version: forgeVersion } = lastVer;
    const options = { overwrite };
    const sharedMap = {};
    const modpack = [
        downloader_3.ModpackDownloader,
        unpacker_3.ModpackUnpacker,
    ];
    const launcher = [
        downloader_2.LauncherDownloader,
        unpacker_2.LauncherUnpacker,
        assetCopier_1.AssetCopier
    ];
    const forge = [
        vanillaManifest_1.VanillaManifestDownloader,
        mcJarDownloader_1.McJarDownloader,
        downloader_1.ForgeDownloader,
        unpacker_1.ForgeUnpacker,
        forgeManifest_1.ForgeManifestCopier,
        LibraryMultiple_1.LibraryMultipleDownloader,
        PostProcessor_1.PostProcessor
    ];
    const versionDir = (0, mcBase_1.getVersionsDir)();
    const forgeDir = path_1.default.join(versionDir, forgeVersion);
    const launcherExe = (0, file_1.getLauncherExe)();
    const hasLauncher = fs_1.default.existsSync(launcherExe);
    const hasForge = fs_1.default.existsSync(forgeDir);
    const toExecute = [
        ...modpack,
        ...(hasLauncher ? [] : launcher),
        ...(hasForge ? [] : forge)
    ];
    logger.debug("Starting processors hasLauncher", hasLauncher, "hasForge", hasForge, "id", id, "ForgeDir", forgeDir, "LauncherExe", launcherExe);
    return toExecute.map(e => new e(id, config, options, sharedMap));
}
exports.getProcessors = getProcessors;
//# sourceMappingURL=processorList.js.map