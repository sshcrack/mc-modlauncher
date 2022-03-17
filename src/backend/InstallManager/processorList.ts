import fs from "fs";
import path from "path";
import { MainLogger } from '../../interfaces/mainLogger';
import { ModpackInfo, Version } from '../../interfaces/modpack';
import { AdditionalOptions } from './event/Processor';
import { getVersionsDir } from './General/mcBase';
import { ForgeDownloader } from './processors/forge/downloader';
import { McJarDownloader } from './processors/forge/jar/mcJarDownloader';
import { ForgeManifestCopier } from './processors/forge/manifest/forgeManifest';
import { VanillaManifestDownloader } from './processors/forge/manifest/vanillaManifest';
import { PostProcessor } from './processors/forge/postProcessors/PostProcessor';
import { ForgeUnpacker } from './processors/forge/unpacker';
import { SharedMap } from './processors/interface';
import { AssetCopier } from './processors/launcher/assetCopier';
import { LauncherDownloader } from './processors/launcher/downloader';
import { getLauncherExe } from './processors/launcher/file';
import { LauncherUnpacker } from './processors/launcher/unpacker';
import { LibraryMultipleDownloader } from './processors/libraries/LibraryMultiple';
import { ModpackDownloader } from './processors/modpack/downloader';
import { getInstanceDestination } from './processors/modpack/file';
import { ModpackUnpacker } from './processors/modpack/unpacker';

const logger = MainLogger.get("InstallManager", "ProcessorList")
export function getProcessors(id: string, config: ModpackInfo, version: Version, overwrite: boolean, validate?: boolean) {
    const { forge_version: forgeVersion } = version

    const options: AdditionalOptions = { overwrite }
    const sharedMap: SharedMap = {}

    const modpack = [
        ModpackDownloader,
        ModpackUnpacker,
    ]

    const launcher = [
        LauncherDownloader,
        LauncherUnpacker,
        AssetCopier
    ]

    const forge = [
        VanillaManifestDownloader,
        McJarDownloader,
        ForgeDownloader,
        ForgeUnpacker,
        ForgeManifestCopier,
        LibraryMultipleDownloader,
        PostProcessor
    ]

    const versionDir = getVersionsDir();
    const forgeDir = path.join(versionDir, forgeVersion)

    const launcherExe = getLauncherExe()
    const modpackFolder = getInstanceDestination(id)


    const hasLauncher = fs.existsSync(launcherExe)
    const hasForge = fs.existsSync(forgeDir)
    const hasModpack = fs.existsSync(modpackFolder)

    const toExecute = [
        ...(hasModpack && validate ? [] : modpack),
        ...(hasLauncher ? [] : launcher),
        ...(hasForge ? [] : forge)
    ]

    logger.debug("Starting processors hasLauncher", hasLauncher, "hasForge", hasForge, "id", id, "ForgeDir", forgeDir, "LauncherExe", launcherExe, "version", version)
    return toExecute.map(e => new e(id, config, version, options, sharedMap))
}