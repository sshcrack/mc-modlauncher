import fs from "fs";
import path from "path";
import { Globals } from '../../Globals';
import { Modpack } from '../../interfaces/modpack';
import { getLauncherDir } from '../processors/launcher/file';


export function getLauncherMC() {
    return path.join(getLauncherDir(), ".minecraft")
}

export function getVersionsDir() {
    return path.join(getLauncherMC(), "versions")
}

export function getVersionJar(versionName: string) {
    return path.join(getVersionsDir(), versionName, `${versionName}.jar`)
}


export function getVersionManifest(versionName: string) {
    return path.join(getVersionsDir(), versionName, `${versionName}.json`)
}

export function getLibrariesDir() {
    return path.join(getLauncherMC(), "libraries");
}


/** Modpack temp/create-0.0.1.zip */
export function getInstallZip(installDir: string, id: string, config: Modpack) {
    const version = Globals.getLastVersion(config)
    const tempDir = Globals.getTempDir(installDir)

    return path.join(tempDir, `${id}-${version.id}.zip`)
}

export function getForgeInstallProfile(installDir: string, id: string, config: Modpack) {
    const forgeDir = getForgeDir(installDir, id, config);

    return path.join(forgeDir, "install_profile.json")
}

/** temp/create-0.0.1-forge.zip */
export function getForgeInstallerZip(installDir: string, id: string, config: Modpack) {
    const version = Globals.getLastVersion(config)
    const tempDir = Globals.getTempDir(installDir)

    return path.join(tempDir, `${id}-${version.id}.forge.zip`)
}

/** temp/create-0.0.1-forge/ */
export function getForgeDir(installDir: string, id: string, config: Modpack) {
    const version = Globals.getLastVersion(config);
    const tempDir = Globals.getTempDir(installDir)

    const dir = path.join(tempDir, `${id}-${version.id}-forge/`)
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true })

    return dir
}