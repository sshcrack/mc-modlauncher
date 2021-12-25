import { app, ipcMain } from "electron";
import fs from "fs"
import path from "path"
import { getLoggerWrapper, LogLevels } from "./baseLogger";

export const MainLogger = getLoggerWrapper((level, scope, ...args) => {
    onLog(false, level as LogLevels, scope, ...args)
})

ipcMain.on("logger", (_, level, scope, ...args) => {
    onLog(true, level as LogLevels, scope, ...args)
})

const appDir = app.getAppPath()
function onLog(fromRenderer: boolean, level: LogLevels, scope: string, ...args: unknown[]) {
    const side = fromRenderer ? "renderer.log" : "main.log"
    const consoleSide = fromRenderer ? "RENDERER" : "MAIN"
    
    const allowedTypes = [ "string", "number", "bigint", "undefined"]
    const strArgs = args.map(e => {
        if(allowedTypes.includes(typeof e))
            return e
        return JSON.stringify(e)
    })
    
    const msg = `${level.toUpperCase()} [${scope}] >> ${strArgs}`
    const logFile = path.join(appDir, side)

    console.log(`${consoleSide}: ${msg}`)
    fs.appendFile(logFile, msg + "\n", err => {
        if(err)
            console.error(err)
    })
}