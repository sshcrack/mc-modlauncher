import { app } from 'electron';
import path from "path";
import { MainGlobals } from '../../../../../../Globals/mainGlobals';

export function getClassPathJar() {
    const installDir = MainGlobals.getInstallDir()
    const temp = MainGlobals.getTempDir(installDir)

    return path.join(temp, "classpath.jar")
}

export function getStdoutFile(jar: string) {
    const logDir = path.join(app.getPath("appData"), "sshmods", "logs")
    const replaceRegex = /[^a-zA-Z0-9\\.\\-]/g;

    const fsFriendly = jar.replace(replaceRegex, "-")

    return path.join(logDir, `${fsFriendly}.log`)
}