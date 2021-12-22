import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { Modpack } from '../../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../../event/Processor';
import { stringToArtifact } from '../Artifact';
import { SharedProcessor } from '../interface';
import { getClassPathJar } from './file';

export class SinglePatcher extends ProcessEventEmitter {
    private shared: SharedProcessor;
    public options: PatcherOptions;

    constructor(id: string, config: Modpack, options: PatcherOptions, shared: SharedProcessor) {
        super(id, config, options);
        this.shared = shared;
        this.options = options;
    }

    public run() {
        return new Promise<void>((resolve, reject) => {
            this.emit("progress", { percent: 0, status: `Patcher ${this.options.jar} is running...` })
            const { argumentData } = this.shared
            const { args, jar } = this.options

            const classpathJar = getClassPathJar()
            const classPathDir = path.dirname(classpathJar)


            const newArgs = processArgs(args, argumentData);
            const jarFile = stringToArtifact(jar).path;


            this.writeClasspaths(classPathDir, classpathJar)
            const allArgs = ["-jar", classpathJar, jarFile, ...newArgs];

            const argStr = allArgs.map(e => '"' + e + '"').join(" ");
            const procName = path.basename(jar)

            console.log("Spawning with args", argStr)
            const child = spawn("java", allArgs, { cwd: classPathDir })

            let stdout = ""
            let stderr = ""

            child.stderr.on("data", err => {
                console.log(err.toString())
                stderr += err;
            })

            child.stdout.on("data", chunk => {
                stdout += chunk
                const length = stdout.length;

                const part = stdout.substring(length - 100);
                this.emit("progress", { percent: 0, status: `Patcher ${this.options.jar} is running...\n${part}` })
            })

            const genErr = () => new Error(`Error running processor ${procName}: \n\nstdout${stdout.toString()}\nstderr ${stderr}\n\n Args: ${argStr}`)

            child.on("exit", code => {
                if (code !== 0)
                    return reject(genErr())
                resolve()
            })
            child.on("error", err => {
                reject(err)
            })

            child.on("close", code => {
                if (code !== 0)
                    return reject(genErr())
                resolve()
            })
        });
    }

    private writeClasspaths(dir: string, classpathJa: string) {
        const { classpath } = this.options;
        const classPathInFileSystem = classpath.map(e => stringToArtifact(e).path);
        classPathInFileSystem.push(classpathJa)

        const classList = path.join(dir, "classpaths.txt")

        fs.writeFileSync(classList, classPathInFileSystem.join("\n"));
    }
}

function processArgs(args: string[], data: Map<string, string>) {
    return args.map(arg => {
        const isArtifact = arg.startsWith("[") && arg.endsWith("]")

        if (!isArtifact)
            return replaceTokens(arg, data);

        const shortened = arg.substring(1, arg.length - 1)
        return stringToArtifact(shortened).path;
    })
}

function replaceTokens(value: string, data: Map<string, string>) {
    let toReturn = ""

    const argLength = value.length
    for (let x = 0; x < argLength; ++x) {
        const c = value.charAt(x)
        if (c === "\\") {
            if (x === argLength - 1)
                throw new Error(`Illegal pattern (Bad escape: ${value})`)

            ++x;
            toReturn += value.charAt(x);
            continue
        }

        if (c !== '{' && c !== "'") {
            toReturn += c;
            continue;
        }

        let key = ""
        for (let y = x + 1; y < argLength; ++y) {
            if (y === argLength)
                throw new Error(`Illegal pattern (Unclosed ${c}): ${value}`)

            const d = value.charAt(y)
            if (d === "\\") {
                if (y === argLength - 1)
                    throw new Error(`Illegal pattern (Bad escape: ${value})`)

                ++y
                key += value.charAt(y)
            } else {
                if (c === "{" && d === "}") {
                    x = y;
                    break;
                }

                if (c === "'" && d === "'") {
                    x = y;
                    break
                }

                key += d;
            }
        }

        if (c === "'")
            toReturn += c
        else {
            if (!data.has(key))
                throw new Error(`Illegal pattern: ${value} Missing key ${key}`)

            toReturn += data.get(key)
        }
    }

    return toReturn
}

export interface PatcherOptions extends AdditionalOptions {
    classpath: string[],
    jar: string,
    args: string[]
}