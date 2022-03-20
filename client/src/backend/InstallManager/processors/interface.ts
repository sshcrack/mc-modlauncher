import fs from "fs";
import path from "path";
import { MainGlobals } from '../../../Globals/mainGlobals';
import { MainLogger } from '../../../interfaces/mainLogger';
import { Version } from '../../../interfaces/modpack';


export type SharedMap = {
    forgeVersion?: string
}

const logger = MainLogger.get("InstallManager", "Processors", "Interface")
export function getInstanceVersionPath(id: string) {
    const installDir = MainGlobals.getInstallDir()
    const instanceDir = MainGlobals.getInstancePathById(installDir, id);

    return path.join(instanceDir, getInstanceVersionFileName())
}

export function getInstanceVersionFileName() {
    return "installed_version.json"
}

export function getInstanceVersion(id: string) {
    const filePath = getInstanceVersionPath(id)
    const exists = fs.existsSync(filePath)
    if(!exists)
        return;

    const version = JSON.parse(fs.readFileSync(filePath, "utf8")) as Version;
    logger.debug("Version for", id, "is", version)
    return version
}