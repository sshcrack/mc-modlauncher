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
exports.Unpacker = void 0;
const fs_1 = __importDefault(require("fs"));
const jszip_1 = __importDefault(require("jszip"));
const path_1 = __importDefault(require("path"));
const unpacker_with_progress_1 = __importDefault(require("unpacker-with-progress"));
const logger_1 = require("../../../interfaces/logger");
const Processor_1 = require("../../event/Processor");
const logger = logger_1.Logger.get("InstallManager", "processors", "Unpacker");
class Unpacker extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options) {
        super(id, config, options);
        this.options = options;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(this.options.messages.extracting);
            this.emit("progress", { percent: 0, status: `Extracting ${this.options.messages.extracting}...` });
            const { destination, src, messages } = this.options;
            const { overwrite } = this.options;
            if (!fs_1.default.existsSync(destination))
                fs_1.default.mkdirSync(destination, { recursive: true });
            if (!fs_1.default.existsSync(src))
                throw new Error(`File ${src} does not exist. (Unpacker)`);
            if (this.options.deleteExistent) {
                logger.debug("Deleting existant files from", src);
                const file = fs_1.default.readFileSync(src);
                const zip = new jszip_1.default();
                yield zip.loadAsync(file);
                const files = Object.values(zip.files)
                    .map(e => e.name);
                files.forEach(e => {
                    const dir = path_1.default.dirname(e);
                    const absFile = path_1.default.join(destination, e);
                    const absDir = path_1.default.join(destination, dir);
                    const check = [absDir, absFile];
                    for (const el of check) {
                        const exists = fs_1.default.existsSync(el);
                        if (e === "" || el === destination || el === destination + "/" || !exists)
                            return;
                        logger.debug("Deleting", absFile);
                        fs_1.default.rmSync(el, { recursive: true, force: true });
                        break;
                    }
                });
            }
            logger.debug("Running unpacker");
            yield (0, unpacker_with_progress_1.default)(src, destination, {
                resume: overwrite,
                onprogress: stats => this.emit("progress", {
                    percent: stats.percent,
                    status: messages.extracting + ` (${stats.unpacked} / ${stats.totalEntries})`
                })
            });
            logger.debug("Done.");
        });
    }
}
exports.Unpacker = Unpacker;
//# sourceMappingURL=Unpacker.js.map