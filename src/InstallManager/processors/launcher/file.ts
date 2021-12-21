import path from 'path';
import { Globals } from '../../../Globals';
import { MainGlobals } from '../../../Globals/mainGlobals';


const installDir = MainGlobals.getInstallDir();
const tempDir = Globals.getTempDir(installDir);

export function getLauncherZip() {
    return path.join(tempDir, "launcher.zip");
}

export function getLauncherDir() {
    return path.join(installDir, "Launcher")
}

