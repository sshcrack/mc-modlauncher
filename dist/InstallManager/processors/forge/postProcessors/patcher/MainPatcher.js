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
exports.MainPatcher = void 0;
const fs_1 = __importDefault(require("fs"));
const source_1 = __importDefault(require("got/dist/source"));
const Globals_1 = require("../../../../../Globals");
const mainGlobals_1 = require("../../../../../Globals/mainGlobals");
const Processor_1 = require("../../../../event/Processor");
const mcBase_1 = require("../../../../General/mcBase");
const file_1 = require("./file");
const SinglePatcher_1 = require("./SinglePatcher");
class MainPatcher extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options, shared) {
        super(id, config, options);
        this.shared = shared;
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emit("progress", { percent: 0, status: "Getting argument maps..." });
            const installDir = mainGlobals_1.MainGlobals.getInstallDir();
            const profilePath = (0, mcBase_1.getForgeInstallProfile)(installDir, this.id, this.config);
            const installProfileRaw = fs_1.default.readFileSync(profilePath, "utf-8");
            const installProfile = JSON.parse(installProfileRaw);
            const processors = installProfile.processors
                .filter(e => !e.sides || e.sides.includes("client"))
                .map(e => new SinglePatcher_1.SinglePatcher(this.id, this.config, Object.assign(Object.assign({}, this.options), e), this.shared));
            const url = `${Globals_1.Globals.baseUrl}/classpath.jar`;
            const jarPath = (0, file_1.getClassPathJar)();
            const res = yield (0, source_1.default)(url);
            fs_1.default.writeFileSync(jarPath, res.rawBody);
            yield Processor_1.ProcessEventEmitter.runMultiple(processors, prog => this.emit("progress", prog));
        });
    }
}
exports.MainPatcher = MainPatcher;
//# sourceMappingURL=MainPatcher.js.map