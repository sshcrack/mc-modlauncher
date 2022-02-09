import { MainGlobals } from '../../../Globals/mainGlobals';
import fs from "fs";
import path from "path";
import { Globals } from '../../../Globals';
import { ModpackInfo } from '../../../interfaces/modpack';
import { getLauncherDir } from '../processors/launcher/file';


export function getLauncherMC() {
    return path.join(getLauncherDir(), ".minecraft")
}

export function getVersionsDir() {
    return path.join(getLauncherDir(), "versions")
}

export function getVersionJar(versionName: string) {
    return path.join(getVersionsDir(), versionName, `${versionName}.jar`)
}


export function getVersionManifest(versionName: string) {
    return path.join(getVersionsDir(), versionName, `${versionName}.json`)
}

export function getLibrariesDir() {
    return path.join(getLauncherDir(), "libraries");
}


/** Modpack temp/create-0.0.1.zip */
export function getInstallZip(installDir: string, id: string, config: ModpackInfo) {
    const version = Globals.getLastVersion(config)
    const tempDir = MainGlobals.getTempDir(installDir)

    return path.join(tempDir, `${id}-${version.id}.zip`)
}

export function getForgeInstallProfile(installDir: string, id: string, config: ModpackInfo) {
    const forgeDir = getForgeDir(installDir, id, config);

    return path.join(forgeDir, "install_profile.json")
}

/** temp/create-0.0.1-forge.zip */
export function getForgeInstallerZip(installDir: string, id: string, config: ModpackInfo) {
    const version = Globals.getLastVersion(config)
    const tempDir = MainGlobals.getTempDir(installDir)

    return path.join(tempDir, `${id}-${version.id}.forge.zip`)
}

/** temp/create-0.0.1-forge/ */
export function getForgeDir(installDir: string, id: string, config: ModpackInfo) {
    const version = Globals.getLastVersion(config);
    const tempDir = MainGlobals.getTempDir(installDir)

    const dir = path.join(tempDir, `${id}-${version.id}-forge/`)
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true })

    return dir
}