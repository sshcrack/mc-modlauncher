import { Globals } from '../../Globals';
import { MainGlobals } from '../../Globals/mainGlobals';
import fs from "fs"
import path from "path"


export type SharedMap = {
    forgeVersion?: string
}

export function getForgeVerPath(id: string) {
    const installDir = MainGlobals.getInstallDir();
    const instanceDir = Globals.getInstancePathById(installDir, id);

    return path.join(instanceDir, "forge_ver.txt");
}

export function getForgeVer(id: string) {
    const forgePath = getForgeVerPath(id)

    return fs.readFileSync(forgePath, "utf8")
}