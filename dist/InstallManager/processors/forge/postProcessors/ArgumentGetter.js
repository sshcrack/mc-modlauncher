"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentGetter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mainGlobals_1 = require("../../../../Globals/mainGlobals");
const logger_1 = require("../../../../interfaces/logger");
const Processor_1 = require("../../../event/Processor");
const mcBase_1 = require("../../../General/mcBase");
const Artifact_1 = require("./Artifact");
const logger = logger_1.Logger.get("Processors", "Forge", "PostProcessors", "ArgumentGetter");
class ArgumentGetter extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options, shared) {
        super(id, config, options);
        this.shared = shared;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit("progress", { percent: 0, status: "Getting argument maps..." });
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            const forge = (0, mcBase_1.getForgeDir)(installDir, this.id, this.config);
            const profilePath = (0, mcBase_1.getForgeInstallProfile)(installDir, this.id, this.config);
            const installProfileRaw = fs_1.default.readFileSync(profilePath, "utf-8");
            const installProfile = JSON.parse(installProfileRaw);
            const data = this.getClientOnly(installProfile);
            const mapped = new Map();
            logger.info("Getting argument maps...");
            Object.entries(data).forEach(([key, value]) => {
                const start = (e) => value.startsWith(e);
                const end = (e) => value.endsWith(e);
                const isArtifact = start("[") && end("]");
                const isData = start("'") && end("'");
                logger.info(`${key}: ${value} is artifact ${isArtifact} is data ${isData}`);
                if (isArtifact) {
                    const artifact = value.substring(1, value.length - 1);
                    return mapped.set(key, (0, Artifact_1.stringToArtifact)(artifact).path);
                }
                if (isData)
                    return mapped.set(key, value);
                const target = path_1.default.join(forge, value);
                const absolute = path_1.default.resolve(target);
                mapped.set(key, absolute);
            });
            const { mcVersion } = this.config;
            const vanillaJar = (0, mcBase_1.getVersionJar)(mcVersion);
            const libraries = (0, mcBase_1.getLibrariesDir)();
            const forgeJar = (0, mcBase_1.getForgeInstallerZip)(installDir, this.id, this.config);
            const dotMc = (0, mcBase_1.getLauncherMC)();
            mapped.set("SIDE", "client");
            mapped.set("MINECRAFT_JAR", vanillaJar);
            mapped.set("MINECRAFT_VERSION", mcVersion);
            mapped.set("ROOT", dotMc);
            mapped.set("INSTALLER", forgeJar);
            mapped.set("LIBRARY_DIR", libraries);
            this.shared.argumentData = mapped;
            logger.log(`Arguments are ${JSON.stringify(mapToObj(mapped))}`);
        });
    }
    getClientOnly(profile) {
        const { data: allData } = profile;
        const mapped = {};
        Object.entries(allData)
            .forEach(([key, sides]) => {
            mapped[key] = sides.client;
        });
        return mapped;
    }
}
exports.ArgumentGetter = ArgumentGetter;
function mapToObj(map) {
    const obj = {};
    for (const [k, v] of map)
        obj[k] = v;
    return obj;
}
//# sourceMappingURL=ArgumentGetter.js.map