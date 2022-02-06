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
exports.cleanupCorrupted = exports.getInstalled = void 0;
const Globals_1 = require("../Globals");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const mainGlobals_1 = require("../Globals/mainGlobals");
const logger_1 = require("../interfaces/logger");
const logger = logger_1.Logger.get("Preload", "instance");
function getInstalled() {
    logger.debug("Getting installed instances...");
    const installDir = mainGlobals_1.MainGlobals.getInstallDir();
    const instances = path_1.default.join(installDir, "Instances");
    if (!fs_1.default.existsSync(instances))
        fs_1.default.mkdirSync(instances, { recursive: true });
    const ids = fs_1.default.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => {
        const creating = Globals_1.Globals.getCreatingFile(installDir, e);
        const files = fs_1.default.readdirSync(path_1.default.join(instances, e));
        return !fs_1.default.existsSync(creating) && files.length !== 0;
    });
    logger.debug("Found", ids, " installed instances", "inDir", instances, "installdir", installDir);
    return ids;
}
exports.getInstalled = getInstalled;
function cleanupCorrupted() {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info("Cleaning up corrupted installations");
        const installDir = mainGlobals_1.MainGlobals.getInstallDir();
        const instances = path_1.default.join(installDir, "Instances");
        if (!fs_1.default.existsSync(instances))
            return;
        const cleared = fs_1.default.readdirSync(instances, { withFileTypes: true })
            .filter(e => e.isDirectory())
            .map(e => e.name)
            .filter(e => !e.includes("-corrupted"))
            .map(e => {
            const instancePath = path_1.default.join(instances, e);
            const creating = Globals_1.Globals.getCreatingFile(installDir, e);
            const uuid = (0, uuid_1.v4)();
            if (!fs_1.default.existsSync(creating))
                return null;
            const dest = instancePath + uuid + "-corrupted";
            logger.debug("Moving", instancePath, "to", dest);
            return fs_1.default.promises.rename(instancePath, dest);
        }).filter(e => e);
        yield Promise.all(cleared);
        const length = cleared.length;
        if (length > 0)
            logger.info("Cleared", length, "corrupted installations");
    });
}
exports.cleanupCorrupted = cleanupCorrupted;
//# sourceMappingURL=instance.js.map