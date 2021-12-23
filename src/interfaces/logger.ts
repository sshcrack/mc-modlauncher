import chalk from "chalk"
import electronLog from "electron-log"

const { LOG_LEVEL } = process.env

export class Logger {
    static formatScope(arr: string[]) {
        return arr.join(":")
    }

    static get(...name: string[]) {
        const logger = electronLog
            .scope(Logger.formatScope(name))

        return logger
    }
}