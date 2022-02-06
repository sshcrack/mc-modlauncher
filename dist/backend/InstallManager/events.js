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
exports.getInstalled = exports.cleanCorrupted = exports.setupInstallManagerEvents = void 0;
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const _1 = require(".");
const mainGlobals_1 = require("../../Globals/mainGlobals");
const mainLogger_1 = require("../../interfaces/mainLogger");
const interface_1 = require("./processors/interface");
const logger = mainLogger_1.MainLogger.get("InstallManager", "Events");
function setupInstallManagerEvents() {
    const { addLock, hasLock, removeLock, remove, install } = _1.InstallManager;
    const onUpdate = (event, prog) => event.reply("modpack_update", prog);
    const sendLockInfo = (event, id) => event.reply("modpack_error", id, "Another installation is in progress");
    const defaultPromReply = (event, id, prom) => __awaiter(this, void 0, void 0, function* () {
        const err = yield prom
            .then(() => { })
            .catch(e => e);
        if (err)
            return event.reply("modpack_error", id, err);
        event.reply("modpack_success");
    });
    electron_1.ipcMain.on("install_modpack", (event, id, overwrite) => __awaiter(this, void 0, void 0, function* () {
        if (hasLock(id))
            return sendLockInfo(event, id);
        addLock(id);
        const prom = install(id, !!overwrite, prog => onUpdate(event, prog));
        yield defaultPromReply(event, id, prom);
        removeLock(id);
    }));
    electron_1.ipcMain.on("update_modpack", (event, id) => __awaiter(this, void 0, void 0, function* () {
        if (hasLock(id))
            return sendLockInfo(event, id);
        addLock(id);
        logger.info("Updating modpack", id);
        const prom = install(id, true, prog => onUpdate(event, prog));
        yield defaultPromReply(event, id, prom);
        removeLock(id);
    }));
    electron_1.ipcMain.on("modpack_remove", (event, id) => __awaiter(this, void 0, void 0, function* () {
        if (hasLock(id))
            return sendLockInfo(event, id);
        addLock(id);
        const prom = remove(id);
        yield defaultPromReply(event, id, prom);
        removeLock(id);
    }));
    electron_1.ipcMain.on("get_version", (event, id) => {
        event.returnValue = (0, interface_1.getInstanceVersion)(id);
    });
    electron_1.ipcMain.on("clean_corrupted", event => {
        cleanCorrupted()
            .then(() => event.reply("clean_corrupted_success"))
            .catch(e => event.reply("clean_corrupted_error", e));
    });
    electron_1.ipcMain.on("get_installed", event => {
        event.returnValue = getInstalled();
    });
    electron_1.ipcMain.on("open_err_dialog", (e, str) => electron_1.dialog.showErrorBox("Error", str));
}
exports.setupInstallManagerEvents = setupInstallManagerEvents;
function cleanCorrupted() {
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
            const creating = mainGlobals_1.MainGlobals.getCreatingFile(installDir, e);
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
exports.cleanCorrupted = cleanCorrupted;
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
        const creating = mainGlobals_1.MainGlobals.getCreatingFile(installDir, e);
        const files = fs_1.default.readdirSync(path_1.default.join(instances, e));
        return !fs_1.default.existsSync(creating) && files.length !== 0;
    });
    logger.debug("Found", ids, " installed instances", "inDir", instances, "installdir", installDir);
    return ids;
}
exports.getInstalled = getInstalled;
//# sourceMappingURL=events.js.map