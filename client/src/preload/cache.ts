import { ipcRenderer } from 'electron';

export const cache = {
    clear: () => {
        return new Promise<string>(resolve => {
            ipcRenderer.once("clear_cache_reply", (_, size) => {
                resolve(size);
            })

            ipcRenderer.send("clear_cache")
        });
    },
    size: () => {
        return new Promise<number>(resolve => {
            ipcRenderer.once("size_cache_reply", (_, size) => {
                resolve(size);
            })

            ipcRenderer.send("size_cache")
        });
    }
}