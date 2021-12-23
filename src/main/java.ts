import { Logger } from '../interfaces/logger';
import { spawnSync } from "child_process"

const logger = Logger.get("Main", "Java")

export function checkJava() {
    const { stdout, stderr } = spawnSync("java", ["-version"])

    const msg = (stdout.toString().includes("java version") ? stdout : stderr).toString()

    const verLine = msg.trim().split("\n")[0]
    if(!verLine.includes("java version"))
        throw new Error(`Java returned invalid statement: ${verLine}`)

    const ver = verLine.split(":").pop()
    logger.info("Java version is", ver)

    return ver;
}
