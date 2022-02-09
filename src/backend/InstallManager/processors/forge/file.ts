import { Globals } from '../../../../Globals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';


const baseUrl = Globals.baseUrl;

export function getForgeUrl(id: string, version: Version): string {
    return `${baseUrl}/${id}/${version.forge}`
}