import { MainLogger } from '../../interfaces/mainLogger';
import { store } from '../preferences';
import fs from "fs"
import { spawn } from "node:child_process";
import { getJavaCreating } from '../LockManager/java';
import { getExeca } from '../util';

const logger = MainLogger.get("Main", "Java")

export async function hasJavaInstalled(): Promise<string|undefined> {
    const currExe = store.get("custom_java")
    const file = getJavaCreating()

    if(fs.existsSync(file))
        return undefined

    const execa = await getExeca()
    return execa(currExe, ["-version"], {})
        .then(({ stdout, stderr }) => {
            const msg = (stdout?.toString()?.includes("java version") ? stdout : stderr)?.toString()


            const verLine = msg?.trim()?.split("\n")?.shift()
            if (!verLine || !verLine?.includes("java version"))
                return undefined

            const ver = verLine.split(":").pop()
            logger.info("Java version is", ver)

            return ver;
        })
        .catch(() => undefined)
}


export function asyncSpawn(...args: Parameters<typeof spawn>) {
    const child = spawn(...args)
    let stdout = ""
    let stderr = ""

    if (child.stdout)
        child.stdout.on('data', data => stdout += data.toString("utf-8"))

    if (child.stderr)
        child.stderr.on('data', data => stderr += data.toString("utf-8"))

    return new Promise<AsyncSpawnReturnType>((resolve, reject) => {
        child.on('error', reject)

        child.on('close', code => {
            const toReturn = {
                code: code,
                stderr: stderr,
                stdout: stdout
            }
            if (code === 0)
                return resolve(toReturn)

            reject(toReturn)
        })
    })
}

export interface AsyncSpawnReturnType {
    code: number,
    stderr: string,
    stdout: string
}