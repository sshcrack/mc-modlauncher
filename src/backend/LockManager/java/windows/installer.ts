import { ProcessEventEmitter } from "../../../InstallManager/event/Processor";
import { asyncSpawn } from "../../../main/java";
import { getJavaDir, getJavaDownloaded } from "../file";

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
    await asyncSpawn(exe, ["/s", `INSTALLDIR="${dest}"`, "STATIC=1", "WEB_JAVA=0", "SPONSORS=0"] , {})
  
    this.emit("progress", {
      status: "Java is now installed.",
      percent: 1
    })

    this.emit("end")
  }
}