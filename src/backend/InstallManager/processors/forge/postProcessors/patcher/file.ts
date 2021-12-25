import path from "path";
import { MainGlobals } from '../../../../../../Globals/mainGlobals';

export function getClassPathJar() {
    const installDir = MainGlobals.getInstallDir()
    const temp = MainGlobals.getTempDir(installDir)

    return path.join(temp, "classpath.jar")
}

export function getStdoutFile(jar: string) {
    const installDir = MainGlobals.getInstallDir()
    const logDir = path.join(installDir, "logs")
    const replaceRegex = /[^a-zA-Z0-9\\.\\-]/g;

    const fsFriendly = jar.replace(replaceRegex, "-")

    return path.join(logDir, `${fsFriendly}.log`)
}