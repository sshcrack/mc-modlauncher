import path from "path"
import { MainGlobals } from "../../../Globals/mainGlobals"

export function getJavaDir() {
  const installDir = MainGlobals.getInstallDir()

  return path.join(installDir, "java")
}

export function getJavaExe() {
  const windowsPath = path.join(getJavaDir(), "bin", "java.exe")
  const linuxPath = path.join(getJavaDir(), "bin", "java")

  return MainGlobals.getOS() === "Windows_NT" ? windowsPath : linuxPath
}

export function getJavaDownloaded() {
  const installDir = MainGlobals.getInstallDir()
  const tempPath = MainGlobals.getTempDir(installDir)

  const windowsPath = path.join(tempPath, "java.exe")
  const linuxPath = path.join(tempPath, "java.tar.gz")

  return MainGlobals.getOS() ? windowsPath : linuxPath
}