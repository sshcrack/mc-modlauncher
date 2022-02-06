import electronLog from "electron-log"
electronLog.transports.file.maxSize = 1024 * 1024 * 20

if (typeof window !== "undefined")
    throw new Error("MainLogger can only be used in the main process.")

export class MainLogger {
    static formatScope(arr: string[]) {
        return arr.join(":")
    }

    static get(...name: string[]) {

        const logger = electronLog
            .scope(MainLogger.formatScope(name))

        return logger
    }
}