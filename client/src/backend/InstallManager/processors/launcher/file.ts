import path from 'path';
import { MainGlobals } from '../../../../Globals/mainGlobals';



export function getLauncherOutput(installDir?: string) {
    installDir = installDir ?? MainGlobals.getInstallDir();
    const tempDir = MainGlobals.getTempDir(installDir);

    const windows = path.join(tempDir, "launcher.msi")
    const linux = path.join(tempDir, "launcher.tar.gz")
    const currOs = MainGlobals.getOS()

    return currOs === "Windows_NT" ? windows : linux;
}

export function getLauncherDir(installDir?: string) {
    installDir = installDir ?? MainGlobals.getInstallDir();

    return path.join(installDir, "Launcher")
}

export function getLauncherExe(installDir?: string) {
    const dir = getLauncherDir(installDir);

    const windows = path.join(dir, "MinecraftLauncher.exe")
    const linux = path.join(dir, "minecraft-launcher")

    const currOs = MainGlobals.getOS()
    return currOs === "Windows_NT" ? windows : linux;
}