import fs from "fs";
import path from 'path';
import tar from "tar-fs";
import { MainGlobals } from '../../../../../Globals/mainGlobals';
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

    fs.createReadStream(launcherSource).pipe(tar.extract(targetDir))
    
    this.emit("progress", {
      status: "Moving files...",
      percent: .5
    })

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