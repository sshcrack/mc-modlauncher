import { ipcRenderer } from 'electron'
import fs from "fs"
import path from "path"

export function getInstalled(): string[] {
    console.log("Getting install dir");

    const installDir = ipcRenderer.sendSync("get_pref", "install_dir")

    const instances = path.join(installDir, "Instances")
    console.log("Creating instances folder at", installDir)

    if (!fs.existsSync(installDir))
        fs.mkdirSync(installDir, { recursive: true })

    console.log("Listing directories")
    const directories = fs.readdirSync(instances, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name);
    return directories
}