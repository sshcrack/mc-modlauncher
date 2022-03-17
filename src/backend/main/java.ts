import { BufferList } from "bl";
import { spawn } from "child_process";
import { MainLogger } from '../../interfaces/mainLogger';

const logger = MainLogger.get("Main", "Java")

export async function checkJava() {
    return asyncSpawn("java", ["-version"], {})
        .then(({ stdout, stderr }) => {
            const msg = (stdout?.toString()?.includes("java version") ? stdout : stderr)?.toString()


            const verLine = msg?.trim()?.split("\n")?.shift()
            if (!verLine || !verLine?.includes("java version"))
                throw new Error(`Java returned invalid statement: ${verLine}. Most likely this means that java is not installedtsc.`)

            const ver = verLine.split(":").pop()
            logger.info("Java version is", ver)

            return ver;
        })
}

export function asyncSpawn(...args: Parameters<typeof spawn>) {
    const child = spawn(...args)
    const stdout = child.stdout ? new BufferList() : ''
    const stderr = child.stderr ? new BufferList() : ''

    if (child.stdout) {
        child.stdout.on('data', data => {
            stdout.append(data)
        })
    }

    if (child.stderr) {
        child.stderr.on('data', data => {
            stderr.append(data)
        })
    }

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
    stderr: BufferList,
    stdout: BufferList
}