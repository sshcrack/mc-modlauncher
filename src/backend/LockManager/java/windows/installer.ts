import { MainLogger } from '../../../../interfaces/mainLogger';
import { ProcessEventEmitter } from "../../../InstallManager/event/Processor";
import { getExeca } from '../../../util';
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
    log.info("Installing java (",exe, ") with arguments", args)

    const execa = await getExeca()
    await execa(exe, args, {})

    this.emit("progress", {
      status: "Java is now installed.",
      percent: 1
    })

    this.emit("end")
  }
}