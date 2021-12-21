import { Globals } from '../../../Globals';
import { MainGlobals } from '../../../Globals/mainGlobals';
import { Modpack } from '../../../interfaces/modpack';


const baseUrl = Globals.baseUrl;
const installDir = MainGlobals.getInstallDir();

export function getUrl(id: string, config: Modpack): string {
    const version = Globals.getLastVersion(config)

    return `${baseUrl}/${id}/${version.forge}`
}

export function getForgeJar(id: string, config: Modpack) {
    const version = Globals.getLastVersion(config)

    return Globals.getForgeZip(installDir, id, version.id)
}


export function getForgeDir(id: string, config: Modpack) {
    const version = Globals.getLastVersion(config)

    return Globals.getForgeDir(installDir, id, version.id);
}