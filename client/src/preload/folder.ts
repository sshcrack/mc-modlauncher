import { ipcMain, ipcRenderer } from 'electron';
import { Progress } from '../backend/InstallManager/event/interface';

export const folder = {
    open: () => ipcRenderer.send("open_folder") as void,
    size: (folder: string) => {
        return new Promise<number>(resolve => {
            ipcRenderer.on("size_folder_reply", (e, innerFolder, size) => {
                console.log("Incoming", folder, innerFolder)
                if(folder !== innerFolder)
                    return

                resolve(size)
            });

            ipcRenderer.send("size_folder", folder)
        });
    },
    select: (dir: string) => {
        return new Promise<string | undefined>(resolve => {
            const id = Math.random()
            ipcRenderer.on("select_folder_reply", (e, innerID, folder) => {
                if (innerID !== id)
                    return

                resolve(folder);
            })

            ipcRenderer.send("select_folder", id, dir);
        });
    },
    move: (src: string, dest: string, onUpdate: (progress: Progress) => unknown) => {
        return new Promise<void>((resolve, reject) => {
            const id = Math.random()
            ipcRenderer.on("folder_move_update", (e, outerId: number, prog: Progress) => {
                if(id !== outerId)
                    return

                onUpdate(prog)
            })
            ipcRenderer.on("folder_move_success", (e, outerId: number) => {
                if(id !== outerId)
                    return

                resolve()
            })
            ipcMain.on("folder_move_error", (e, outerId: number, err: Error) => {
                if(id !== outerId)
                    return

                reject(err)
            })

            ipcRenderer.send("folder_move", id, src, dest)
        });
    }
}