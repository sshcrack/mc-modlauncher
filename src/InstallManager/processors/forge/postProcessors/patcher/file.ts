import { Globals } from '../../../../../Globals';
import { MainGlobals } from '../../../../../Globals/mainGlobals';
import path from "path"

export function getClassPathJar() {
    const installDir = MainGlobals.getInstallDir()
    const temp = Globals.getTempDir(installDir)

    return path.join(temp, "classpath.jar")
}