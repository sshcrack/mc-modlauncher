import { Globals } from '../../../../Globals';
import { MainGlobals } from '../../../../Globals/mainGlobals';
import { Version } from '../../../../interfaces/modpack';


const baseUrl = Globals.baseUrl;

export function getUrl(id: string, version: Version): string {
    return `${baseUrl}/${id}/${version.file}`
}

export function getInstanceDestination(id: string) {
    const installDir = MainGlobals.getInstallDir();
    return MainGlobals.getInstancePathById(installDir, id);
}