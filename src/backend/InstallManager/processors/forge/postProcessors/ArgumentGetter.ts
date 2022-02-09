import fs from "fs";
import path from "path";
import { MainGlobals } from '../../../../../Globals/mainGlobals';
import { MainLogger } from '../../../../../interfaces/mainLogger';
import { ModpackInfo, Version } from '../../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { InstallProfile } from '../../../General/installProfile';
import { getForgeDir, getForgeInstallerZip, getForgeInstallProfile, getLauncherMC, getLibrariesDir, getVersionJar } from '../../../General/mcBase';
import { getInstanceVersion } from '../../interface';
import { stringToArtifact } from './Artifact';
import { SharedProcessor } from './interface';

const logger = MainLogger.get("Processors", "Forge", "PostProcessors", "ArgumentGetter")
export class ArgumentGetter extends ProcessEventEmitter {
    private shared: SharedProcessor;

    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions, shared: SharedProcessor) {
        super(id, config, version, options);
        this.shared = shared;
    }

    public async run() {
        this.emit("progress", { percent: 0, status: "Getting argument maps..."})

        const installDir = MainGlobals.getInstallDir()
        const forge = getForgeDir(installDir, this.id, this.version)

        const profilePath = getForgeInstallProfile(installDir, this.id, this.version)
        const installProfileRaw = fs.readFileSync(profilePath, "utf-8");
        const installProfile: InstallProfile = JSON.parse(installProfileRaw);

        const data = this.getClientOnly(installProfile);
        const mapped = new Map<string, string>();

        logger.info("Getting argument maps...")
        Object.entries(data).forEach(([key, value]) => {
            const start = (e: string) => value.startsWith(e);
            const end = (e: string) => value.endsWith(e)

            const isArtifact = start("[") && end("]")
            const isData = start("'") && end("'")

            logger.info(`${key}: ${value} is artifact ${isArtifact} is data ${isData}`)
            if(isArtifact) {
                const artifact = value.substring(1, value.length - 1)
                return mapped.set(key, stringToArtifact(artifact).path);
            }

            if (isData)
                return mapped.set(key, value)

            const target = path.join(forge, value)
            const absolute = path.resolve(target);

            mapped.set(key, absolute)
        })

        const { mcVersion: configVer } = this.config;
        const { mcVersion: instanceMc } = getInstanceVersion(this.id)
        const mcVersion = instanceMc ?? configVer;

        const vanillaJar = getVersionJar(mcVersion)
        const libraries = getLibrariesDir()

        const forgeJar = getForgeInstallerZip(installDir, this.id, this.version)

        const dotMc = getLauncherMC();

        mapped.set("SIDE", "client")
        mapped.set("MINECRAFT_JAR", vanillaJar)
        mapped.set("MINECRAFT_VERSION", mcVersion)
        mapped.set("ROOT", dotMc)
        mapped.set("INSTALLER", forgeJar)
        mapped.set("LIBRARY_DIR", libraries)

        this.shared.argumentData = mapped;
        logger.log(`Arguments are ${JSON.stringify(mapToObj(mapped))}`)
    }

    private getClientOnly(profile: InstallProfile) {
        const { data: allData } = profile;
        const mapped: JSONObject<string> = {};

        Object.entries(allData)
            .forEach(([key, sides]) => {
                mapped[key] = sides.client
            })

        return mapped;
    }
}

function mapToObj<T>(map: Map<string, T>) {
    const obj: JSONObject<T> = {}
    for (const [k, v] of map)
        obj[k] = v
    return obj
}

export type JSONObject<T> ={
    [key: string]: T
}

