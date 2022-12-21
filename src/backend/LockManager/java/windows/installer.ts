import fs from "fs"
import path from 'path';
import { MainGlobals } from '../../../../Globals/mainGlobals';
import { MainLogger } from '../../../../interfaces/mainLogger';
import { ProcessEventEmitter } from "../../../InstallManager/event/Processor";
import { getExeca, getExecaCommand } from '../../../util';
import { getJavaDir, getJavaDownloaded } from "../file";

const log = MainLogger.get("Java", "Windows", "Installer")
export class WindowsJavaInstaller extends ProcessEventEmitter {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(null, {} as any, {} as any, {} as any)
  }

  public async run() {
    const exe = getJavaDownloaded()
    const dest = getJavaDir()

    this.emit("progress", {
      status: "Installing java...",
      percent: 0
    })

    const args = ["/s", `INSTALLDIR="${dest}"`, "STATIC=1", "WEB_JAVA=0", "SPONSORS=0"];

    const batchFileContent = `"${exe}" ${args.join(" ")}\nexit`
    const tempFile = path.join(MainGlobals.getTempDir(MainGlobals.getInstallDir()), "run.bat")

    fs.writeFileSync(tempFile, batchFileContent)
    log.info("Installing java (",exe, ") with arguments", args)

    const execa = await getExeca()
    log.info("Actually running")
    const proc = execa("cmd", ["/K", "start", "call", tempFile])
    proc.stdin.end()
    await proc

    log.info("Java installed. Sending exit signal")
    this.emit("progress", {
      status: "Java is now installed.",
      percent: 1
    })

    this.emit("end")
  }
}