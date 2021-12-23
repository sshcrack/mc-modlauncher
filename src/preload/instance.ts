import { Globals } from '../Globals';
import fs from "fs";
import path from "path";
import { v4 as randomUUID } from "uuid"
import { MainGlobals } from '../Globals/mainGlobals';
import { Logger } from '../interfaces/logger';

const logger = Logger.get("Preload", "instance")
export function getInstalled(): string[] {
    logger.debug("Getting installed instances...")

    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if (!fs.existsSync(instances))
        fs.mkdirSync(instances, { recursive: true })

    const ids = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => {
            const creating = Globals.getCreatingFile(installDir, e)
            const files = fs.readdirSync(path.join(instances, e))

            return !fs.existsSync(creating) && files.length !== 0
        })


    logger.debug("Found", ids, " installed instances", "inDir", instances, "installdir", installDir)
    return ids
}

export async function cleanupCorrupted() {
    logger.info("Cleaning up corrupted installations")
    const installDir = MainGlobals.getInstallDir()
    const instances = path.join(installDir, "Instances")

    if(!fs.existsSync( instances))
        return;

    const cleared = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .filter(e => !e.includes("-corrupted"))
        .map(e => {
            const instancePath = path.join(instances, e);
            const creating = Globals.getCreatingFile(installDir, e)
            const uuid = randomUUID()

            if (!fs.existsSync(creating))
                return null

                const dest = instancePath + uuid + "-corrupted"
            logger.debug("Moving", instancePath, "to", dest)

            return fs.promises.rename(instancePath, dest)
        }).filter(e => e)

    await Promise.all(cleared)
    const length = cleared.length;
    if(length > 0)
        logger.info("Cleared", length, "corrupted installations")
}