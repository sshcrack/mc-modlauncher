export function getLoggerWrapper(loggerFunc: ReportLogFunc) {
    const genLogger = (scope: string, getterFunc: ReportLogFunc) => {
        const levels: LogType[] = [ "verbose", "warn", "error", "debug", "silly", "info"]
        const loggerObj = {} as LoggerObj
        levels.forEach(level => {
            loggerObj[level] = (...args: unknown[]) => getterFunc(level, scope, ...args)
        })
    }

    return {
        get: (scope: string) => {
            return genLogger(scope, loggerFunc)
        }
    }
}


export type LoggerObj = {
    [key in LogType]: GetLogger
}

export type ReportLogFunc = (debugLevel: string, scope: string, ...args: unknown[]) => void;
export type GetLogger = (...args: unknown[]) => void
export type LogSource = "main" | "renderer"
export type LogType = "verbose" | "warn" | "error" | "info" | "debug" | "silly"