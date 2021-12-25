import "bootstrap"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../theme.css"
import "./index.css"

import { Logger } from '../../interfaces/logger';
import { updateModpacks } from './modpack';

const logger = Logger.get("Preload", "Main")
const { modpack, preferences} = window.api

window.onload = async () => {
    modpack.clean();

    await updateModpacks();
    await addPrefEvent();
    queueUpdating()
}

async function queueUpdating() {
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
        preferences.open();
    });
}