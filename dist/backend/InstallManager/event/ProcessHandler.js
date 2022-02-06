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
exports.ProcessHandler = void 0;
const events_1 = __importDefault(require("events"));
class ProcessHandler extends events_1.default {
    constructor(emitters) {
        super();
        this.emitters = emitters;
    }
    runAll(onProgress) {
        return __awaiter(this, void 0, void 0, function* () {
            const length = this.emitters.length;
            for (let i = 0; i < this.emitters.length; i++) {
                const emitter = this.emitters[i];
                const currMultiplier = i / length;
                emitter.on("progress", ({ percent, status }) => onProgress({
                    percent: percent * currMultiplier,
                    status
                }));
                yield emitter.startProcessing();
            }
        });
    }
}
exports.ProcessHandler = ProcessHandler;
//# sourceMappingURL=ProcessHandler.js.map