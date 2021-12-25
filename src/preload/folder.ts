import { ipcRenderer } from 'electron';

export const folder = {
    open: () => ipcRenderer.send("open_folder") as void,
    select: (dir: string) => {
        return new Promise<string>(resolve => {
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