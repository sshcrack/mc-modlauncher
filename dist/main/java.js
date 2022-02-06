"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJava = void 0;
const logger_1 = require("../interfaces/logger");
const child_process_1 = require("child_process");
const logger = logger_1.Logger.get("Main", "Java");
function checkJava() {
    var _a, _b, _c, _d;
    const { stdout, stderr } = (0, child_process_1.spawnSync)("java", ["-version"]);
    const msg = (_b = (((_a = stdout === null || stdout === void 0 ? void 0 : stdout.toString()) === null || _a === void 0 ? void 0 : _a.includes("java version")) ? stdout : stderr)) === null || _b === void 0 ? void 0 : _b.toString();
    const verLine = (_d = (_c = msg === null || msg === void 0 ? void 0 : msg.trim()) === null || _c === void 0 ? void 0 : _c.split("\n")) === null || _d === void 0 ? void 0 : _d.shift();
    if (!verLine || !(verLine === null || verLine === void 0 ? void 0 : verLine.includes("java version")))
        throw new Error(`Java returned invalid statement: ${verLine}. Most likely this means that java is not installedtsc.`);
    const ver = verLine.split(":").pop();
    logger.info("Java version is", ver);
    return ver;
}
exports.checkJava = checkJava;
//# sourceMappingURL=java.js.map