import { ipcRenderer } from 'electron';

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
    }
}