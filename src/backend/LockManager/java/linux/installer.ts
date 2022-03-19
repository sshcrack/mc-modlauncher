import fs from "fs/promises";
import path from "path";
import { MainGlobals } from "../../../../Globals/mainGlobals";
import { extractProm } from "../../../../interfaces/tools";
import { ProcessEventEmitter } from "../../../InstallManager/event/Processor";
import { moveDirectory } from '../../../main/folder';
import { getJavaDir, getJavaDownloaded } from "../file";

export class LinuxJavaInstaller extends ProcessEventEmitter {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(null, {} as any, {} as any, {} as any)
  }

  public async run() {
    const installDir = MainGlobals.getInstallDir()

    const javaArchive = getJavaDownloaded()
    const temp = MainGlobals.getTempDir(installDir)

    const targetDir = path.join(temp, "javatar")

    this.emit("progress", {
      status: "Unpacking tar.gz java...",
      percent: 0
    })

    await extractProm(javaArchive, targetDir, p => this.emit("progress", {
      status: "Unpacking tar.gz java...",
      percent: p / 2
    }))

    // Getting first dir cause extract would be /java/jre_8_u/
    const dirsInsideJava = await fs.readdir(targetDir)
    if (dirsInsideJava.length === 0)
      throw "No dirs inside java archive"

    const tempJavaDir = path.join(targetDir, dirsInsideJava[0])
    const destJava = getJavaDir()

    await moveDirectory({
      src: tempJavaDir,
      dest: destJava,
      onUpdate: prog => this.emit("progress", { status: prog.status, percent: prog.percent / 2 + .5 })
    })

    this.emit("progress", {
      status: "Java install done.",
      percent: 1
    })

    this.emit("end")
  }
}
