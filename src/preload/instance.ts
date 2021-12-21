import fs from "fs"
import path from "path"
import { Logger } from '../interfaces/logger';
import { store} from "../preferences/renderer"

const logger = Logger.get("Preload", "instance")
export function getInstalled(): string[] {
    logger.await("Getting installed instances...")

    const installDir = store.get("install_dir");

    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(installDir))
        fs.mkdirSync(installDir, { recursive: true })

    const directories = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => fs.readdirSync(path.join(instances, e)).length > 0);

    logger.success("Found", directories.length, "installed instances")
    return directories
}