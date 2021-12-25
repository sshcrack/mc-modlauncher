import path from 'path';
import { MainGlobals } from '../../../../Globals/mainGlobals';



export function getLauncherZip() {
    const installDir = MainGlobals.getInstallDir();
    const tempDir = MainGlobals.getTempDir(installDir);

    return path.join(tempDir, "launcher.zip");
}

export function getLauncherDir() {
    const installDir = MainGlobals.getInstallDir();

    return path.join(installDir, "Launcher")
}

export function getLauncherExe() {
    const dir = getLauncherDir();

    return path.join(dir, "MinecraftLauncher.exe");
}
