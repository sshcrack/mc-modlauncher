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
exports.ProcessEventEmitter = void 0;
const mainLogger_1 = require("../../../interfaces/mainLogger");
const events_1 = __importDefault(require("events"));
const logger = mainLogger_1.MainLogger.get("InstallManager", "Processor");
class ProcessorEventEmitterClass extends events_1.default {
    constructor(id, config, options) {
        super();
        this.id = id;
        this.config = config;
        this.options = options;
    }
    startProcessing() {
        if (this.processProm)
            return this.processProm;
        this.processProm = new Promise((resolve, reject) => {
            this.on("end", (error) => {
                if (error)
                    return reject(error);
                resolve();
            });
            this.run()
                .then(() => this.emit("end"))
                .catch(e => this.emit("end", e));
        });
        return this.processProm;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.error("Processor Event Emitter not implemented. Caution");
            return undefined;
        });
    }
    static runMultiple(emitters, onProgress, maxDigits = 2) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info("Running multiple emitters");
            const length = emitters.length;
            for (let i = 0; i < length; i++) {
                logger.debug(i, "/", length);
                const emitter = emitters[i];
                const currMultiplier = 1 / length;
                const alreadyDone = i * currMultiplier;
                emitter.on("progress", ({ percent, status }) => {
                    const totalPercent = percent * currMultiplier + alreadyDone;
                    const multiplier = Math.pow(10, maxDigits);
                    const rounded = Math.round(totalPercent * multiplier) / multiplier;
                    onProgress({
                        percent: rounded,
                        status
                    });
                });
                const err = yield emitter.startProcessing()
                    .then(() => undefined)
                    .catch(e => e);
                if (err)
                    throw err;
            }
        });
    }
}
class ProcessEventEmitter extends ProcessorEventEmitterClass {
}
exports.ProcessEventEmitter = ProcessEventEmitter;
//# sourceMappingURL=Processor.js.map