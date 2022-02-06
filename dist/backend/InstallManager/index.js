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
const fs_1 = __importDefault(require("fs"));
const got_1 = __importDefault(require("got"));
const Globals_1 = require("../../Globals");
const mainGlobals_1 = require("../../Globals/mainGlobals");
const mainLogger_1 = require("../../interfaces/mainLogger");
const Processor_1 = require("./event/Processor");
const events_1 = require("./events");
const processorList_1 = require("./processorList");
const interface_1 = require("./processors/interface");
const baseUrl = Globals_1.Globals.baseUrl;
const logger = mainLogger_1.MainLogger.get("InstallManager");
class InstallManager {
    static initialize() {
        (0, events_1.setupInstallManagerEvents)();
    }
    static getConfig(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const configRes = yield (0, got_1.default)(`${baseUrl}/${id}/config.json`);
            if (!configRes)
                return;
            return JSON.parse(configRes.body);
        });
    }
    static install(id, update = false, onUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info("Installing modpack", id);
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            const installations = (0, events_1.getInstalled)();
            const instanceDir = mainGlobals_1.MainGlobals.getInstancePathById(installDir, id);
            const reportError = (err) => {
                fs_1.default.rmSync(instanceDir, { recursive: true, force: true });
                throw new Error(err);
            };
            logger.debug("Making directory", id);
            if (!fs_1.default.existsSync(instanceDir))
                fs_1.default.mkdirSync(instanceDir);
            if (installations.includes(id) && !update)
                return reportError("Modpack already installed.");
            onUpdate({ percent: 0, status: "Getting config..." });
            logger.debug("Getting config", id);
            const config = yield InstallManager.getConfig(id)
                .catch(e => reportError(e));
            logger.silly("Config is", config);
            if (!config) {
                return reportError("Could not download modpack configuration");
            }
            const createFile = mainGlobals_1.MainGlobals.getCreatingFile(installDir, id);
            fs_1.default.writeFileSync(createFile, "");
            const res = yield this.runProcessors(id, config, update, {
                onUpdate,
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
        });
    }
    static runProcessors(id, config, overwrite, { onUpdate: sendUpdate, reportError }) {
        return __awaiter(this, void 0, void 0, function* () {
            const processors = (0, processorList_1.getProcessors)(id, config, overwrite);
            return yield Processor_1.ProcessEventEmitter.runMultiple(processors, p => sendUpdate(p))
                .then(() => true)
                .catch(e => reportError(e));
        });
    }
    static remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const installDir = mainGlobals_1.MainGlobals.getInstallDir();
                const instanceDir = mainGlobals_1.MainGlobals.getInstancePathById(installDir, id);
                logger.info("Removing modpack", id, "at path", instanceDir);
                fs_1.default.promises.rmdir(instanceDir, { recursive: true })
                    .then(() => {
                    logger.log("Removed modpack", id);
                    resolve();
                })
                    .catch(e => {
                    logger.error("Failed to remove modpack", id, e);
                    reject(e);
                });
            });
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