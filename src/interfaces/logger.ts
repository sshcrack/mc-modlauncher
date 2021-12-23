import electronLog from "electron-log"

electronLog.transports.file.maxSize = 1024 * 1024 * 20
export class Logger {
    static formatScope(arr: string[]) {
        return arr.join(":")
    }

    static get(...name: string[]) {
        const logger = electronLog
            .scope(Logger.formatScope(name))

        return logger
    }
}g