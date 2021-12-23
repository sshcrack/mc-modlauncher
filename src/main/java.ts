import { Logger } from '../interfaces/logger';
import { spawnSync } from "child_process"

const logger = Logger.get("Main", "Java")

export function checkJava() {
    const { stdout, stderr } = spawnSync("java", ["-version"])

    if(stderr.toString().trim().length > 0)
        throw new Error(`Java is not installed or not in path: ${stderr}`)

    const verLine = stdout.toString().trim().split("\n")[0]
    if(!verLine.includes("java version"))
        throw new Error(`Java returned invalid statement: ${verLine}`)

    const ver = verLine.split(":").pop()
    logger.info("Java version is", ver)

    return ver;
}
