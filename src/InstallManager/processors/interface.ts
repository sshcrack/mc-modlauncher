import fs from "fs";
import path from "path";
import { Globals } from '../../Globals';
import { MainGlobals } from '../../Globals/mainGlobals';
import { Version } from '../../interfaces/modpack';


export type SharedMap = {
    forgeVersion?: string
}

export function getInstanceVersionPath(id: string) {
    const installDir = MainGlobals.getInstallDir()
    const instanceDir = Globals.getInstancePathById(installDir, id);

    return path.join(instanceDir, "installed_version.json")
}

export function getInstanceVersion(id: string) {
    console.log("Getting instance version")

    const filePath = getInstanceVersionPath(id)
    const exists = fs.existsSync(filePath)
    if(!exists)
        return;

    return JSON.parse(fs.readFileSync(filePath, "utf8")) as Version
}