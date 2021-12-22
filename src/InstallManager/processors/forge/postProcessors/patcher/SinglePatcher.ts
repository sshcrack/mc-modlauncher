import { spawnSync } from "child_process";
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

    public async run() {
        this.emit("progress", { percent: 0, status: `Patcher ${this.options.jar} is running...` })
        const { argumentData } = this.shared
        const { classpath, args, jar } = this.options

        const jarFile = stringToArtifact(jar).path;
        const classPathInFileSystem = classpath.map(e => stringToArtifact(e).path);

        const newArgs = processArgs(args, argumentData);
        const classpathJar = getClassPathJar()
        const classPathDir = path.dirname(classpathJar)
        const classList = path.join(classPathDir, "classpaths.txt")

        fs.writeFileSync(classList, classPathInFileSystem.join("\n"));
        const { stdout, stderr } = spawnSync("java", ["-jar", jarFile, ...newArgs])

        if(stderr)
            throw new Error(`Error running processor ${path.basename(jar)}: ${stderr.toString("utf-8")}`)

        console.log(stdout.toString("utf-8"));
    }
}

function processArgs(args: string[], data: Map<string, string>) {
    return args.map(arg => {
        const isArtifact = arg.startsWith("[") && arg.endsWith("]")

        if(!isArtifact)
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
        if(c === "\\") {
            if (x === argLength -1)
                throw new Error(`Illegal pattern (Bad escape: ${value})`)

            ++x;
            toReturn += value.charAt(x);
            continue
        }

        if(c !== '{' && c !== "'") {
            toReturn += c;
            continue;
        }

        let key = ""
        for(let y = x +1; y < argLength; ++y) {
            if(y === argLength)
                throw new Error(`Illegal pattern (Unclosed ${c}): ${value}`)

            const d = value.charAt(y)
            if(d === "\\") {
                if(y === argLength -1)
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

        if(c === "'")
            toReturn += c
        else {
            if(!data.has(key))
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