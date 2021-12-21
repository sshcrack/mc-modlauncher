import chalk from "chalk"
import signale from "signale"

const { LOG_LEVEL } = process.env
const globalLogger = new signale.Signale({
    config: {
        displayDate: true,
        displayTimestamp: true,
    },
    logLevel: LOG_LEVEL
})

export class Logger {
    static formatScope(arr: string[]) {
        const color = [
            (str: string) => chalk.bgBlue(chalk.black(str)),
            (str: string) => chalk.cyan(str),
            (str: string) => chalk.magenta(str),
            (str: string) => chalk.yellow(str)
        ]

        const defaultColor = (str: string) => chalk.hex("73706e")(str)
        const str = arr.map((e, i) => {
            const currColor = color[i] ?? defaultColor
            return currColor(e)
        }).join(":")
        return str
    }

    static get(...name: string[]) {
        const scope = Logger.formatScope(name)
        const logger = globalLogger
            .scope(scope)

        return logger
    }

    static getInteractive<T extends string>(logger: signale.Signale<T>) {

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        logger._interactive = true
        return logger
    }
}