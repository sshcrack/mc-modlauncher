"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SinglePatcher = void 0;
const logger_1 = require("../../../../../interfaces/logger");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Processor_1 = require("../../../../event/Processor");
const Artifact_1 = require("../Artifact");
const file_1 = require("./file");
class SinglePatcher extends Processor_1.ProcessEventEmitter {
    constructor(id, config, options, shared) {
        super(id, config, options);
        this.shared = shared;
        this.options = options;
        this.logger = this.getLogger();
    }
    getLogger() {
        return logger_1.Logger.get("InstallManager", "processors", "forge", "postProcessors", "patcher", "SinglePatcher", this.options.jar);
    }
    run() {
        return new Promise((resolve, reject) => {
            const logger = this.logger;
            this.emit("progress", { percent: 0, status: `Patcher ${this.options.jar} is running...` });
            const { argumentData } = this.shared;
            const { args, jar } = this.options;
            const classpathJar = (0, file_1.getClassPathJar)();
            const classPathDir = path_1.default.dirname(classpathJar);
            const newArgs = this.processArgs(args, argumentData);
            const jarFile = (0, Artifact_1.stringToArtifact)(jar).path;
            this.writeClasspaths(classPathDir, classpathJar);
            const allArgs = ["-jar", classpathJar, jarFile, ...newArgs];
            const argStr = allArgs.map(e => '"' + e + '"').join(" ");
            const procName = path_1.default.basename(jar);
            logger.info("Spawning", jar, "with args", argStr);
            const child = (0, child_process_1.spawn)("java", allArgs, { cwd: classPathDir });
            let stdout = "";
            let stderr = "";
            child.stderr.on("data", (err) => {
                logger.error(err.toString());
                stderr += err;
            });
            child.stdout.on("data", (chunk) => {
                stdout += chunk;
                const length = stdout.length;
                const part = stdout.substring(length - 100);
                logger.silly(chunk.toString());
                this.emit("progress", { percent: 0, status: `Patcher ${jar} is running...\n${part}` });
            });
            const genErr = () => new Error(`Error running processor ${procName}: \n\nstdout${stdout.toString()}\nstderr ${stderr}\n\n Args: ${argStr}`);
            child.on("exit", code => {
                if (code !== 0)
                    return reject(genErr());
                resolve();
            });
            child.on("error", err => {
                reject(err);
            });
            child.on("close", code => {
                if (code !== 0)
                    return reject(genErr());
                resolve();
            });
        });
    }
    writeClasspaths(dir, classpathJar) {
        const logger = this.logger;
        const { classpath } = this.options;
        const classPathInFileSystem = classpath.map(e => (0, Artifact_1.stringToArtifact)(e).path);
        classPathInFileSystem.push(classpathJar);
        logger.debug("Classpaths raw", classpath, "now", classPathInFileSystem);
        const classList = path_1.default.join(dir, "classpaths.txt");
        fs_1.default.writeFileSync(classList, classPathInFileSystem.join("\n"));
    }
    processArgs(args, data) {
        this.logger.debug("Args are", args, "data is now", Array.from(data.entries()));
        return args.map(arg => {
            const isArtifact = arg.startsWith("[") && arg.endsWith("]");
            if (!isArtifact)
                return this.replaceTokens(arg, data);
            const shortened = arg.substring(1, arg.length - 1);
            return (0, Artifact_1.stringToArtifact)(shortened).path;
        });
    }
    replaceTokens(value, data) {
        this.logger.silly("Replying tokens of", value, "with data", Array.from(data.entries()));
        let toReturn = "";
        const argLength = value.length;
        for (let x = 0; x < argLength; ++x) {
            const c = value.charAt(x);
            if (c === "\\") {
                if (x === argLength - 1)
                    throw new Error(`Illegal pattern (Bad escape: ${value})`);
                ++x;
                toReturn += value.charAt(x);
                continue;
            }
            if (c !== '{' && c !== "'") {
                toReturn += c;
                continue;
            }
            let key = "";
            for (let y = x + 1; y < argLength; ++y) {
                if (y === argLength)
                    throw new Error(`Illegal pattern (Unclosed ${c}): ${value}`);
                const d = value.charAt(y);
                if (d === "\\") {
                    if (y === argLength - 1)
                        throw new Error(`Illegal pattern (Bad escape: ${value})`);
                    ++y;
                    key += value.charAt(y);
                }
                else {
                    if (c === "{" && d === "}") {
                        x = y;
                        break;
                    }
                    if (c === "'" && d === "'") {
                        x = y;
                        break;
                    }
                    key += d;
                }
            }
            if (c === "'")
                toReturn += c;
            else {
                if (!data.has(key))
                    throw new Error(`Illegal pattern: ${value} Missing key ${key}`);
                toReturn += data.get(key);
            }
        }
        return toReturn;
    }
}
exports.SinglePatcher = SinglePatcher;
//# sourceMappingURL=SinglePatcher.js.map