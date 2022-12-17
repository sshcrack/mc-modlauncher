import { spawn } from "child_process";
import { MainGlobals } from '../../../../Globals/mainGlobals';
import { ModpackInfo, Version } from '../../../../interfaces/modpack';
import { getJavaExe } from '../../../LockManager/java/file';
import { AdditionalOptions, ProcessEventEmitter } from '../../event/Processor';
import { getFabricInstallerJar } from '../../General/mcBase';
import { getLauncherDir } from '../launcher/file';



export class FabricInstaller extends ProcessEventEmitter {
    constructor(id: string, config: ModpackInfo, version: Version, options: AdditionalOptions) {
        super(id, config, version, options);

        this.id = id;
        this.config = config;
    }

    public async run() {
        const { fabric_loader } = this.version
        const mcVersion = this.version.mcVersion ?? this.config.mcVersion;
        this.emit("progress", { percent: 0, status: "Installing fabric..."})

        const installDir = MainGlobals.getInstallDir()
        const fabricJar = getFabricInstallerJar(installDir)
        const javaExe = getJavaExe()
        const launcherDir = getLauncherDir()



        const proc = spawn(javaExe, [ "-jar", fabricJar, "client", "-dir", launcherDir, "-loader", fabric_loader, "-mcversion", mcVersion, "-noprofile"])
        let currData = ""
        let currErr = ""

        proc.stdout.on("data", (e: Buffer) => {
            currData += e.toString("utf-8")
            if(!currData.includes("\n"))
                return

            const line = currData.split("\n").shift()
            currData = ""

            this.emit("progress", { percent: .5, status: `${line}`})
        })
        proc.stderr.on("data", (e: Buffer) => {
            currErr += e.toString("utf-8")
        })

        await new Promise<void>((resolve, reject) => {
            proc.on("exit", code => {
                if(code !== 0)
                    return reject(new Error(`Process exited with code ${code} currErr is: ${currErr}`))

                resolve()
            })
        });

        if(currErr)
            throw new Error(currErr);

        this.emit("end")
    }
}