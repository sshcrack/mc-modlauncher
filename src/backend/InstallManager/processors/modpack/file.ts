import { Globals } from '../../../../Globals';
import { MainGlobals } from '../../../../Globals/mainGlobals';
import { Modpack } from '../../../../interfaces/modpack';


const baseUrl = Globals.baseUrl;

export function getUrl(id: string, config: Modpack): string {
    const version = Globals.getLastVersion(config)

    return `${baseUrl}/${id}/${version.file}`
}

export function getInstanceDestination(id: string) {
    const installDir = MainGlobals.getInstallDir();
    return Globals.getInstancePathById(installDir, id);
}