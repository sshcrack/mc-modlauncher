"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Globals = void 0;
class Globals {
    static getLastVersion(config) {
        let versions = config;
        if (Object.keys(config).includes("versions"))
            versions = config.versions;
        const last = versions.length - 1;
        const lastItem = versions[last];
        return lastItem;
    }
}
exports.Globals = Globals;
Globals.baseUrl = "https://mc.sshcrack.me";
//# sourceMappingURL=index.js.map