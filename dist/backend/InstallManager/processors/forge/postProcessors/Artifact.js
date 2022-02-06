"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToArtifact = void 0;
const path_1 = __importDefault(require("path"));
const mcBase_1 = require("../../../General/mcBase");
function stringToArtifact(descriptor) {
    const split = descriptor.split(":");
    const lastIndex = split.length - 1;
    const lastElement = split[lastIndex];
    let ext = "jar";
    if (lastElement.includes("@")) {
        const temp = lastElement.split("@");
        ext = temp.pop();
        split[lastIndex] = temp.join("@");
    }
    const [domain, name, version] = split;
    const classifier = split.length > 3 ? split[3] : null;
    const addition = classifier ? `-${classifier}` : "";
    const file = `${name}-${version}${addition}.${ext}`;
    const relativePath = `${domain.split(".").join("/")}/${name}/${version}/${file}`;
    const launcherDir = (0, mcBase_1.getLibrariesDir)();
    const absolutePath = path_1.default.resolve(path_1.default.join(launcherDir, relativePath));
    return {
        descriptor,
        name,
        domain,
        version,
        classifier,
        ext,
        file,
        path: absolutePath
    };
}
exports.stringToArtifact = stringToArtifact;
//# sourceMappingURL=Artifact.js.map