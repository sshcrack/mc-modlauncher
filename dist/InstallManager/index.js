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
exports.InstallManager = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const path_1 = __importDefault(require("path"));
const Globals_1 = require("../Globals");
const mainGlobals_1 = require("../Globals/mainGlobals");
const logger_1 = require("../interfaces/logger");
const instance_1 = require("../preload/instance");
const Processor_1 = require("./event/Processor");
const mcBase_1 = require("./General/mcBase");
const downloader_1 = require("./processors/forge/downloader");
const mcJarDownloader_1 = require("./processors/forge/jar/mcJarDownloader");
const forgeManifest_1 = require("./processors/forge/manifest/forgeManifest");
const vanillaManifest_1 = require("./processors/forge/manifest/vanillaManifest");
const PostProcessor_1 = require("./processors/forge/postProcessors/PostProcessor");
const unpacker_1 = require("./processors/forge/unpacker");
const interface_1 = require("./processors/interface");
const assetCopier_1 = require("./processors/launcher/assetCopier");
const downloader_2 = require("./processors/launcher/downloader");
const file_1 = require("./processors/launcher/file");
const unpacker_2 = require("./processors/launcher/unpacker");
const LibraryMultiple_1 = require("./processors/libraries/LibraryMultiple");
const downloader_3 = require("./processors/modpack/downloader");
const unpacker_3 = require("./processors/modpack/unpacker");
const baseUrl = Globals_1.Globals.baseUrl;
const logger = logger_1.Logger.get("InstallManager");
class InstallManager {
    static getConfig(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const configRes = yield axios_1.default.get(`${baseUrl}/${id}/config.json`);
            if (!configRes)
                return;
            return JSON.parse(configRes.body);
        });
    }
    static install(id, event, update = false) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info("Installing modpack", id);
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            const installations = (0, instance_1.getInstalled)();
            const instanceDir = Globals_1.Globals.getInstancePathById(installDir, id);
            const sendUpdate = ({ percent, status }) => event.reply("modpack_update", id, percent, status);
            const reportError = (err) => {
                fs_1.default.rmSync(instanceDir, { recursive: true, force: true });
                event.reply("modpack_error", id, err);
            };
            logger.debug("Making directory", id);
            if (!fs_1.default.existsSync(instanceDir))
                fs_1.default.mkdirSync(instanceDir);
            if (installations.includes(id) && !update)
                return reportError("Modpack already installed.");
            sendUpdate({ percent: 0, status: "Getting config..." });
            logger.debug("Getting config", id);
            const config = yield InstallManager.getConfig(id)
                .catch(e => reportError(e));
            logger.silly("Config is", config);
            if (!config) {
                return reportError("Could not download modpack configuration");
            }
            const createFile = Globals_1.Globals.getCreatingFile(installDir, id);
            fs_1.default.writeFileSync(createFile, "");
            const res = yield this.runProcessors(id, config, update, {
                sendUpdate,
                reportError
            });
            if (!res)
                return;
            try {
                fs_1.default.rmSync(createFile);
            }
            catch (e) { /** */ }
            const installedPath = (0, interface_1.getInstanceVersionPath)(id);
            const lastVersion = Globals_1.Globals.getLastVersion(config);
            fs_1.default.writeFileSync(installedPath, JSON.stringify(lastVersion));
            event.reply("modpack_success", id);
        });
    }
    static runProcessors(id, config, overwrite, { sendUpdate, reportError }) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastVer = Globals_1.Globals.getLastVersion(config);
            const { forge_version: forgeVersion } = lastVer;
            const options = { overwrite };
            const sharedMap = {};
            const modpack = [
                downloader_3.ModpackDownloader,
                unpacker_3.ModpackUnpacker,
            ];
            const launcher = [
                downloader_2.LauncherDownloader,
                unpacker_2.LauncherUnpacker,
                assetCopier_1.AssetCopier
            ];
            const forge = [
                vanillaManifest_1.VanillaManifestDownloader,
                mcJarDownloader_1.McJarDownloader,
                downloader_1.ForgeDownloader,
                unpacker_1.ForgeUnpacker,
                forgeManifest_1.ForgeManifestCopier,
                LibraryMultiple_1.LibraryMultipleDownloader,
                PostProcessor_1.PostProcessor
            ];
            const versionDir = (0, mcBase_1.getVersionsDir)();
            const forgeDir = path_1.default.join(versionDir, forgeVersion);
            const launcherExe = (0, file_1.getLauncherExe)();
            const hasLauncher = fs_1.default.existsSync(launcherExe);
            const hasForge = fs_1.default.existsSync(forgeDir);
            const toExecute = [
                ...modpack,
                ...(hasLauncher ? [] : launcher),
                ...(hasForge ? [] : forge)
            ];
            const processors = toExecute.map(e => new e(id, config, options, sharedMap));
            logger.debug("Starting processors hasLauncher", hasLauncher, "hasForge", hasForge, "id", id, "ForgeDir", forgeDir, "LauncherExe", launcherExe);
            return yield Processor_1.ProcessEventEmitter.runMultiple(processors, p => sendUpdate(p))
                .then(() => true)
                .catch(e => reportError(e));
        });
    }
    static remove(id, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            const instanceDir = Globals_1.Globals.getInstancePathById(installDir, id);
            logger.info("Removing modpack", id, "at path", instanceDir);
            fs_1.default.promises.rmdir(instanceDir, { recursive: true })
                .then(() => {
                logger.info("Removed modpack with id", id);
                event.reply("remove_modpack_success", id);
            })
                .catch(e => {
                logger.error("Failed to remove modpack", id, e);
                event.reply("remove_modpack_error", id, e);
            });
        });
    }
    static addListeners() {
        const sendEvent = (event, name) => event.reply(name, "Another installation is in progress");
        electron_1.ipcMain.on("install_modpack", (event, id, overwrite) => __awaiter(this, void 0, void 0, function* () {
            if (this.hasLock(id))
                return sendEvent(event, "modpack_error");
            this.addLock(id);
            yield InstallManager.install(id, event, !!overwrite);
            this.removeLock(id);
        }));
        electron_1.ipcMain.on("update_modpack", (event, id) => {
            if (this.hasLock(id))
                return sendEvent(event, "modpack_error");
            logger.info("Updating modpack", id);
            InstallManager.install(id, event, true);
        });
        electron_1.ipcMain.on("remove_modpack", (event, id) => __awaiter(this, void 0, void 0, function* () {
            if (this.hasLock(id))
                return sendEvent(event, "remove_modpack_error");
            this.addLock(id);
            yield InstallManager.remove(id, event);
            this.removeLock(id);
        }));
        electron_1.ipcMain.on("get_version", (event, id) => {
            event.returnValue = (0, interface_1.getInstanceVersion)(id);
        });
    }
    static hasLock(id) {
        return this.locks.includes(id);
    }
    static removeLock(id) {
        this.locks = this.locks.filter(e => e !== id);
    }
    static addLock(id) {
        this.locks.push(id);
    }
}
exports.InstallManager = InstallManager;
InstallManager.locks = [];
//# sourceMappingURL=index.js.map