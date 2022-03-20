import fs from "fs";
import path from 'path';
import { MainGlobals } from '../../../../../Globals/mainGlobals';
import { extractProm } from "../../../../../interfaces/tools";
import { ProcessEventEmitter } from '../../../event/Processor';
import { getLauncherExe, getLauncherOutput } from '../file';

export class LinuxLauncherUnpacker extends ProcessEventEmitter {
  public async run() {
    const installDir = MainGlobals.getInstallDir()

    const launcherSource = getLauncherOutput(installDir)
    const temp = MainGlobals.getTempDir(installDir)

    const targetDir = path.join(temp, "launchertar")

    this.emit("progress", {
      status: "Unpacking tar.gz launcher...",
      percent: 0
    })

    await extractProm(launcherSource, targetDir, p => this.emit("progress", {
      status: "Unpacking tar.gz launcher...",
      percent: p
    }))

    const mcExe = path.join(targetDir, "minecraft-launcher", "minecraft-launcher")
    const launcherExe = getLauncherExe()
    const launcherDir = path.dirname(launcherExe)

    if (!fs.existsSync(launcherDir))
      fs.mkdirSync(launcherDir, { recursive: true })

    fs.renameSync(mcExe, launcherExe)
    fs.chmodSync(mcExe, 755)

    this.emit("progress", {
      status: "Launcher install done.",
      percent: 1
    })

    this.emit("end")
  }
}