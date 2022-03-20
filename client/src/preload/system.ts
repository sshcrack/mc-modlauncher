import { DiskSpace } from "check-disk-space";
import { ipcRenderer } from "electron";

const uninstallWarning = "Are you sure you want to uninstall this modpack? This will delete all files, settings, options and controls";

export const system = {
    memory: () => {
        return new Promise<number>(resolve => {
            ipcRenderer.on("get_mem_reply", (_, mem) => resolve(mem))
            ipcRenderer.send("get_mem")
        });
    },
    disk: {
        size: (diskPath: string) => {
            return new Promise<DiskSpace | undefined>(resolve => {
                ipcRenderer.on("system_disk_size_reply", (_, innerDiskPath, size) => {
                    if (innerDiskPath !== diskPath)
                        return

                    resolve(size)
                })

                ipcRenderer.send("system_disk_size", diskPath)
            });
        }
    },
    prompt: {
        uninstall: () => ipcRenderer.sendSync("confirm_prompt", uninstallWarning) as boolean,
        error: (str: string) => ipcRenderer.send("open_err_dialog", str)
    },
    java: {
        version: () => {
            return new Promise<string | undefined>(resolve => {
                ipcRenderer.on("check_java_reply", (_, ver) => resolve(ver))
                ipcRenderer.send("check_java")
            })
        },
        install: () => {
            return new Promise<void>((resolve, reject) => {
                ipcRenderer.on("java_install_success", () => resolve())
                ipcRenderer.on("java_install_error", (_, err) => reject(err))
                ipcRenderer.send("java_install")
            });
        }
    }
}