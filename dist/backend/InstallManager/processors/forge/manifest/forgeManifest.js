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
exports.ForgeManifestCopier = void 0;
const mainGlobals_1 = require("../../../../../Globals/mainGlobals");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mainLogger_1 = require("../../../../../interfaces/mainLogger");
const Processor_1 = require("../../../event/Processor");
const mcBase_1 = require("../../../General/mcBase");
const logger = mainLogger_1.MainLogger.get('ForgeManifestCopier');
//!This sets forge_version in options, run before using forge_version
class ForgeManifestCopier extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options, sharedMap) {
        super(id, config, options);
        this.id = id;
        this.config = config;
        this.shared = sharedMap;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit("progress", { percent: 0, status: "Copying forge version..." });
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            const forgeDir = (0, mcBase_1.getForgeDir)(installDir, this.id, this.config);
            const installProfilePath = (0, mcBase_1.getForgeInstallProfile)(installDir, this.id, this.config);
            logger.info("Reading", installProfilePath);
            const installProfile = JSON.parse(fs_1.default.readFileSync(installProfilePath, "utf-8"));
            const { version: forgeVersion } = installProfile;
            this.shared.forgeVersion = forgeVersion;
            const versionsDir = (0, mcBase_1.getVersionsDir)();
            //.minecraft/1.18.1-forge.../
            const currVersion = path_1.default.join(versionsDir, forgeVersion);
            //.minecraft/1.18.1-forge.../1.18.1-forge...
            const versionFile = path_1.default.join(currVersion, `${forgeVersion}.json`);
            if (!fs_1.default.existsSync(currVersion))
                fs_1.default.mkdirSync(currVersion, { recursive: true });
            this.emit("progress", { percent: 50, status: "Writing to disk..." });
            const forgeFile = path_1.default.join(forgeDir, `version.json`);
            yield fs_1.default.promises.copyFile(forgeFile, versionFile);
        });
    }
}
exports.ForgeManifestCopier = ForgeManifestCopier;
//# sourceMappingURL=forgeManifest.js.map