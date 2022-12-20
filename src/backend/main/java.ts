import { MainLogger } from '../../interfaces/mainLogger';
import { store } from '../preferences';
import fs from "fs"
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