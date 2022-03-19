import { ipcMain } from 'electron';
import fs, { WriteStream } from "fs";
import got from "got";
import Request, { Progress } from 'got/dist/source/core';
import path from 'path';
import prettyBytes from 'pretty-bytes';
import unpacker from "unpacker-with-progress";
import LockManager from '..';
import { Globals } from '../../../Globals';
import { MainGlobals } from '../../../Globals/mainGlobals';
import { MainLogger } from '../../../interfaces/mainLogger';
import { ProcessEventEmitter } from '../../InstallManager/event/Processor';
import { hasJavaInstalled } from '../../main/java';
import { store } from '../../preferences';
import { JavaDownloader } from './downloader';
import { getJavaDir, getJavaExe } from './file';
import { LinuxJavaInstaller } from './linux';
import { WindowsJavaInstaller } from './windows/installer';

const logger = MainLogger.get("Backend", "LockManager", "java")
export function addJavaListeners() {
    ipcMain.on("java_install", (e) => {
        downloadExtractJava()
            .then(() => e.reply("java_install_success"))
            .catch(err => e.reply("java_install_error", err))
    })
}

async function downloadExtractJava() {
    const hasJava = await hasJavaInstalled();
    if (hasJava)
        return

    await LockManager.lockProm();
    LockManager.lock({
        percent: 0,
        status: "Downloading Java..."
    })

    const installer = MainGlobals.getOS() === "Windows_NT" ?
        WindowsJavaInstaller : LinuxJavaInstaller
    
    const creatingFile = getJavaCreating()
    await ProcessEventEmitter.runMultiple([
        new JavaDownloader(),
        new installer()
    ], p => LockManager.updateListeners(p), 2)
    
    store.set("custom_java", getJavaExe())
    fs.unlinkSync(creatingFile)
    logger.error("Unlinking file")
    LockManager.unlock({
        percent: 100,
        status: "Done unpacking and downloading java."
    })
}

export function getJavaCreating(javaDir?: string) {
    return path.join(javaDir ?? getJavaDir(), ".installing_java_sshmods")
}