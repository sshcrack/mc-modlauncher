import { ipcRenderer } from 'electron';
import { Logger } from '../interfaces/logger';
import { updateModpacks } from './modpack';


const logger = Logger.get("Preload", "Main")
export async function handleIndex() {
    ipcRenderer.sendSync("clean_corrupted")

    await updateModpacks();
    await addPrefEvent();
    queueUpdating()
}

export async function queueUpdating() {
    await new Promise<void>(resolve => {
        setTimeout(() => resolve(), 60000)
    })

    await updateModpacks();
    queueUpdating();
}

async function addPrefEvent() {
    const prefBtn = document.getElementById("settings");
    prefBtn.addEventListener("click", () => {
        logger.info("Sending opening signal to preferences...")
        ipcRenderer.send("open_prefs");
    });
}