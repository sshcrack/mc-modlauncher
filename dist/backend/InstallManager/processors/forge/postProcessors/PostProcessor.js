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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostProcessor = void 0;
const Processor_1 = require("../../../event/Processor");
const ArgumentGetter_1 = require("./ArgumentGetter");
const PatchCopier_1 = require("./PatchCopier");
const MainPatcher_1 = require("./patcher/MainPatcher");
//const logger = Logger.get("InstallManager", "PostProcessors", "PostProcessor")
class PostProcessor extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options, shared) {
        super(id, config, options);
        this.shared = shared;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const sharedMap = Object.assign(this.shared);
            const processors = [
                ArgumentGetter_1.ArgumentGetter,
                MainPatcher_1.MainPatcher,
                PatchCopier_1.PatchCopier
            ].map(e => new e(this.id, this.config, this.options, sharedMap));
            yield Processor_1.ProcessEventEmitter.runMultiple(processors, prog => {
                this.emit("progress", prog);
            });
        });
    }
}
exports.PostProcessor = PostProcessor;
//# sourceMappingURL=PostProcessor.js.map