import { ipcMain, IpcMainEvent } from 'electron';
import fs from "fs";
import got from "got";
import unpacker from "unpacker-with-progress"
import Request from 'got/dist/source/core';
import path from "path";
import { Modpack } from '../interfaces/modpack';
import { store } from '../preferences/renderer';

const base = "https://mc.sshbot.ddnss.de/"
export class InstallManager {
    static async install(id: string, event: IpcMainEvent, overwrite = false) {
        const reportError = (err: string) => event.reply("install_modpack_error", id, err);
        const sendUpdate = (prog: number) => event.reply("install_modpack_update", id, prog)

        const installDir = store.get("install_dir");
        const instances = path.join(installDir, "Instances");
        const mainDir = path.join(instances, id);
        const installZip = path.join(mainDir, "install.zip")

        if(fs.existsSync(instances))
            fs.mkdirSync(instances);

        const installed = fs.existsSync(mainDir);
        if(installed && !overwrite)
            return reportError("Modpack already installed.")

        const configRes = await got(`${base}/${id}/config.json`).catch(e => {
            reportError("Could not get config of modpack")
        });

        if(!configRes)
            return;

        if(configRes.statusCode !== 200)
            return reportError("Invalid response code")

        const config: Modpack = JSON.parse(configRes.body);
        const { file: installName } = config.versions.pop();

        let writeStream: fs.WriteStream;
        const download = (retryStream: Request): Promise<void> => {
            return new Promise(resolve => {
                const stream = retryStream ?? got.stream(`${base}/${id}/${installName}`);

                if (writeStream)
                    writeStream.destroy()

                writeStream = fs.createWriteStream(installZip)
                stream.pipe(writeStream);

                stream.once('retry', (_, _1, createRetryStream) => {
                    download(createRetryStream());
                });

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                stream.on("downloadProgress", (prog: Progress) => {
                    sendUpdate(prog.percent)
                })

                stream.once("end", () => resolve())
            });
        }

        await download(null);
        await unpacker(installZip, mainDir, {
            resume: false,
            onprogress: (stats) => {
                sendUpdate(stats.percent)
            }
        });

        event.reply("install_modpack_success", id);
    }

    static addListeners() {
        ipcMain.on("install_modpack", (event, id) => {
            InstallManager.install(id, event);
        })

        ipcMain.on("update_modpack", (event, id) => {
            InstallManager.install(id, event, true)
        })
    }
}