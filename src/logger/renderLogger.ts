import { ipcRenderer } from "electron";
import { getLoggerWrapper } from "./baseLogger";

export const RendererLogger = getLoggerWrapper((level, scope, ...args) => {
    ipcRenderer.sendSync("logger", level, scope, ...args)
})