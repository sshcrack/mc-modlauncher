import { ModpackInfo, Version } from '../interfaces/modpack';

export class Globals {
    static baseUrl = "https://mc.sshcrack.me";
    static get javaDownloadUrl() : string {
        return Globals.baseUrl + "/java_8.zip"
    }


    static getLastVersion(config: ModpackInfo | Version[]) {
        let versions = config as Version[];

        if(Object.keys(config).includes("versions"))
            versions =(config as ModpackInfo).versions;

        const last = versions.length - 1
        const lastItem = versions[last];

        return lastItem
    }
}