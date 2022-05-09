import { Globals } from '../Globals';
import { ModOptions } from './mods/search_mods';

const curseforgeUrl = Globals.baseUrl + "/api/v1"
const gameId = 432
const modClass = 6
export default class Curseforge {
    static featured_mods({ sortField, sortOrder}: ModOptions) {

        return `${curseforgeUrl}/mods/search?gameId=${gameId}&classId=6&sortField=${sortField}&sortOrder=${sortOrder}`
    }
}