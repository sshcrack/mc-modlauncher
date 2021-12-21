import path from "path"
import { getLauncherDir } from '../../launcher/file'

export function getDotMC() {
    return path.join(getLauncherDir(), ".minecraft")
}

export function getVersionsDir() {
    return path.join(getDotMC(), "versions")
}