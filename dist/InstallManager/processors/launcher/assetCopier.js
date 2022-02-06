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
exports.AssetCopier = void 0;
const path_1 = __importDefault(require("path"));
const Processor_1 = require("../../event/Processor");
const file_1 = require("./file");
const fs_extra_1 = __importDefault(require("fs-extra"));
class AssetCopier extends Processor_1.ProcessEventEmitter {
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit("progress", { percent: 0, status: "Copying assets..." });
            const { APPDATA } = process.env;
            const oldAssetsDir = path_1.default.join(APPDATA, ".minecraft", "assets");
            const assetDir = path_1.default.join((0, file_1.getLauncherDir)());
            const toCopy = [
                "objects",
                "indexes"
            ];
            const single = 1 / toCopy.length;
            let i = 0;
            for (const folder of toCopy) {
                const progress = i * single;
                this.emit("progress", { percent: progress, status: `Copying ${folder}...` });
                const source = path_1.default.join(oldAssetsDir, folder);
                const dest = path_1.default.join(assetDir, folder);
                yield fs_extra_1.default.copy(source, dest);
                i++;
            }
        });
    }
}
exports.AssetCopier = AssetCopier;
//# sourceMappingURL=assetCopier.js.map