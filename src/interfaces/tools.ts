import jaguar from "jaguar"

export function extractProm(archive: string, dest: string, onUpdate: (prog: number) => void) {
    return new Promise<void>((resolve, reject) => {
        const emitter = jaguar.extract(archive, dest)
        emitter.on("end", () => resolve())
        emitter.on("error", err => reject(err))
        emitter.on("progress", prog => onUpdate(prog))
    });
}