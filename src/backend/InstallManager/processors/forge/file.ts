import { Globals } from '../../../../Globals';
import { ModpackInfo } from '../../../../interfaces/modpack';


const baseUrl = Globals.baseUrl;

export function getForgeUrl(id: string, config: ModpackInfo): string {
    const version = Globals.getLastVersion(config)

    return `${baseUrl}/${id}/${version.forge}`
}