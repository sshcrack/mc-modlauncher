import { hasJavaInstalled } from '../main/java';
import { store } from '../preferences';
import fs, { WriteStream } from "fs"
import got from "got"
import unpacker from "unpacker-with-progress";
import LockManager from '.';
import { Globals } from '../../Globals';
import { MainGlobals } from '../../Globals/mainGlobals';
import path from 'path';
import Request, { Progress } from 'got/dist/source/core';
import { MainLogger } from '../../interfaces/mainLogger';
import { ipcMain } from 'electron';
import prettyBytes from 'pretty-bytes';

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

    const installDir = MainGlobals.getInstallDir()
    const destinationDir = MainGlobals.getTempDir(installDir)
    const javaZip = path.join(destinationDir, "java_8.zip")
    const javaDir = path.join(installDir, "Launcher", "java8")
    const javaBin = path.join(javaDir, "bin")

    if(!fs.existsSync(javaBin))
        fs.mkdirSync(javaBin, { recursive: true })

    const creatingFile = getJavaCreating(javaBin)
    fs.writeFileSync(creatingFile, "")

    logger.log("Downloading java...")
    await downloadJava(javaZip, 0, 2)
    await unpackJava(javaZip, javaDir, 1, 2)


    const javaUnpackedExe = path.join(javaBin, "java.exe")
    if(!fs.existsSync(javaUnpackedExe)) {
        logger.error("Java was not extracted correctly")
        LockManager.unlock({
            percent: 50,
            status: "Could not find java.exe"
        })

        throw "Could not find java.exe"
    }

    store.set("custom_java", javaUnpackedExe)
    fs.unlinkSync(creatingFile)
    logger.error("Unlinking file")
    LockManager.unlock({
        percent: 100,
        status: "Done unpacking and downloading java."
    })
}

async function unpackJava(zip: string, dir: string, id: number, max: number) {
    if(!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true})

    await unpacker(zip, dir, {
        resume: false,
        onprogress: stats =>
            LockManager.updateListeners({
                percent: stats.percent / max + id / max,
                status: `Extracting (${stats.unpacked} / ${stats.totalEntries})`
            })
    })
}

async function downloadJava(destination: string, id: number, max: number) {
    let writeStream: WriteStream


    const generateDownload = (retryStream: Request): Promise<void> => {
        return new Promise(resolve => {
            const stream =
                retryStream ??
                got.stream(Globals.javaDownloadUrl)

            if (writeStream)
                writeStream.destroy()

            writeStream = fs.createWriteStream(destination);

            stream.pipe(writeStream)

            stream.once("retry", (_, _1, createReadStream) => {
                logger.warn("Connection aborted, retrying...")
                generateDownload(createReadStream());
            })

            stream.on("downloadProgress", (prog: Progress) => {
                const currStatus = prog.total ? `(${prettyBytes(prog.transferred)}/${prettyBytes(prog.total)})` : ""
                LockManager.updateListeners({
                    percent: prog.percent / max + id / max,
                    status: `Downloading Java ${currStatus}...`
                })
            })

            stream.once("end", () => resolve());
        });
    }

    await generateDownload(null);
}

export function getJavaCreating(binDir: string) {
    return path.join(binDir, ".installing_java_sshmods")
}