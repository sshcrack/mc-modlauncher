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
exports.PatchCopier = void 0;
const mcBase_1 = require("../../../General/mcBase");
const Processor_1 = require("../../../event/Processor");
const fs_1 = __importDefault(require("fs"));
class PatchCopier extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options, shared) {
        super(id, config, options);
        this.shared = shared;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const { argumentData, forgeVersion } = this.shared;
            const patchedPath = argumentData.get("PATCHED");
            const jarPath = (0, mcBase_1.getVersionJar)(forgeVersion);
            this.emit("progress", { percent: 0, status: "Copying patched client..." });
            yield fs_1.default.promises.copyFile(patchedPath, jarPath);
        });
    }
}
exports.PatchCopier = PatchCopier;
//# sourceMappingURL=PatchCopier.js.map