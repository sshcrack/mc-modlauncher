import path from 'path';
import { Globals } from '../../../Globals';
import { MainGlobals } from '../../../Globals/mainGlobals';



export function getLauncherZip() {
    const installDir = MainGlobals.getInstallDir();
    const tempDir = Globals.getTempDir(installDir);

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
