import path from 'path';
import fs from "fs"
import { MainGlobals } from '../../../../../Globals/mainGlobals';
import { asyncSpawn } from '../../../../main/java';
import { ProcessEventEmitter } from '../../../event/Processor';
import { getLauncherExe, getLauncherOutput } from '../file';

export class WindowsLauncherUnpacker extends ProcessEventEmitter {
  public async run() {
    const installDir = MainGlobals.getInstallDir()

    const launcherSource = getLauncherOutput(installDir)
    const temp = MainGlobals.getTempDir(installDir)

    const targetDir = path.join(temp, "launchermsi")

    this.emit("progress", {
      status: "Unpacking msi...",
      percent: 0
    })
    
    await asyncSpawn("msiexec", ["/a", launcherSource, "/qn", `TARGETDIR=${targetDir}`], {})
    this.emit("progress", {
      status: "Moving files...",
      percent: .5
    })

    const mcExe = path.join(targetDir, "Minecraft Launcher", "MinecraftLauncher.exe")
    const launcherExe = getLauncherExe()
    const launcherDir = path.dirname(launcherExe)

    if (!fs.existsSync(launcherDir))
      fs.mkdirSync(launcherDir, { recursive: true })

    fs.renameSync(mcExe, launcherExe)
    this.emit("progress", {
      status: "Launcher install done.",
      percent: 1
    })

    this.emit("end")
  }
}