import fs from "fs";
import path from "path";
import { MainGlobals } from '../Globals/mainGlobals';
import { Logger } from '../interfaces/logger';

const logger = Logger.get("Preload", "instance")
export function getInstalled(): string[] {
    logger.await("Getting installed instances...")

    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(instances))
        fs.mkdirSync(instances, { recursive: true })

    const directories = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => fs.readdirSync(path.join(instances, e)).length > 0);

    logger.success("Found", directories.length, "installed instances")
    return directories
}