import path from 'path';
import { MainGlobals } from '../../../../Globals/mainGlobals';



export function getLauncherZip(installDir?: string) {
    installDir = installDir ?? MainGlobals.getInstallDir();
    const tempDir = MainGlobals.getTempDir(installDir);

    return path.join(tempDir, "launcher.zip");
}

export function getLauncherDir(installDir?: string) {
    installDir = installDir ?? MainGlobals.getInstallDir();

    return path.join(installDir, "Launcher")
}

export function getLauncherExe(installDir?: string) {
    const dir = getLauncherDir(installDir);

    return path.join(dir, "MinecraftLauncher.exe");
}