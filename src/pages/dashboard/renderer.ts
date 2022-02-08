import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../theme.scss"
import "./index.scss"

import { RenderLogger } from '../../interfaces/renderLogger';
import { updateModpacks } from './modpack';

const log = RenderLogger.get("Preload", "Main")
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


    const prefOpen = preferences.isOpen();
    log.debug("Preferences are currently", prefOpen ? "open" : "closed")

    if (!prefOpen) {
        log.debug("Queue updating modpacks...")
        await updateModpacks();
    }
    queueUpdating();
}

async function addPrefEvent() {
    const prefBtn = document.getElementById("settings");
    prefBtn.addEventListener("click", async () => {
        log.info("Sending opening signal to preferences...")
        await preferences.open();
    });
}