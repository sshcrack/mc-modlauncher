import { Globals } from '../../../../Globals';
import { Modpack } from '../../../../interfaces/modpack';


const baseUrl = Globals.baseUrl;

export function getForgeUrl(id: string, config: Modpack): string {
    const version = Globals.getLastVersion(config)

    return `${baseUrl}/${id}/${version.forge}`
}