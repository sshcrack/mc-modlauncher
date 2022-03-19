import jaguar from "jaguar"
import { MainLogger } from "./mainLogger";

const logger = MainLogger.get("Interfaces", "tools")
export function extractProm(archive: string, dest: string, onUpdate: (prog: number) => void) {
    return new Promise<void>((resolve, reject) => {
        logger.log("Extracting", archive, "to", dest)
        const emitter = jaguar.extract(archive, dest)
        emitter.on("end", () => resolve())
        emitter.on("error", err => reject(err))
        emitter.on("progress", prog => onUpdate(prog))
        emitter.on("file", f => logger.log("Extracted", f))
    });
}