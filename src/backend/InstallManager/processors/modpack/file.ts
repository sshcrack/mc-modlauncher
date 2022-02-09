import { Globals } from '../../../../Globals';
import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo } from '../../../../interfaces/modpack';


const baseUrl = Globals.baseUrl;

export function getUrl(id: string, config: ModpackInfo): string {
    const version = Globals.getLastVersion(config)

    return `${baseUrl}/${id}/${version.file}`
}

export function getInstanceDestination(id: string) {
    const installDir = MainGlobals.getInstallDir();
    return MainGlobals.getInstancePathById(installDir, id);
}