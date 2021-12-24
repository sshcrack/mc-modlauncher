import { RenderGlobals } from '../Globals/renderGlobals';
import { ipcRenderer } from 'electron';
import { Logger } from '../interfaces/logger';
import { Modpack } from '../interfaces/modpack';
import { setLock, updateModpacks } from './modpack';

const logger = Logger.get("Preload", "Buttons")

export function addButtonAction(id: string, btn: HTMLElement, installed: boolean, config: Modpack) {
    btn.addEventListener("click", async () => {
        const newestVersion = RenderGlobals.hasLatest(id, config)


        if(installed && newestVersion)
            return ipcRenderer.send("launch_mc", id, config)

        setLock(true)

        const parent = btn.parentElement;
        parent.childNodes.forEach(e => e.remove())

        const progress = document.createElement("div");
        progress.className = "progress";
        progress.id = `install-progress-${id}`

        progress.innerHTML = `<div class="progress-bar" style="width: 0%" role="progressbar">0%</div>`

        parent.appendChild(progress)
        const bar = progress.querySelector(".progress-bar") as unknown as HTMLElement

        ipcRenderer.on("modpack_update", (_, innerId, percentage, status) => {
            if (id !== innerId)
                return;

            const perStr = `${Math.round(percentage * 100)}%`
            updateStatus(id, status)

            bar.style.width = perStr;
            bar.innerText = perStr;
        })

        ipcRenderer.on("modpack_success", (_, innerId) => {
            if (id !== innerId)
                return;

            updateModpacks(true);
        })

        ipcRenderer.on("modpack_error", (e, innerId, error) => {
            if (id !== innerId)
                return;

            updateStatus(id, null)
            const err = error?.stack ?? error?.message ?? error;
            logger.error(err);
            alert(`Error installing modpack ${innerId}: ${err}. Please restart to avoid errors.`)

            updateModpacks(true);
        })

        //overwrite = newestVersion
        ipcRenderer.send("install_modpack", id, !newestVersion);
    })
}

export function getButtonDiv(id: string, installed: boolean, config: Modpack) {
    const newestVersion = RenderGlobals.hasLatest(id, config)

    const txt = installed ? (newestVersion ? "Play" : "Update") : "Install"
    const classBtn = installed && newestVersion ? "btn-open" : "btn-install"

    const div = document.createElement("div");
    div.className = "card-action";

    const actionButton = `<button class="btn btn-primary btn-primary-highlight ${classBtn} card-action-btn" href="#" id="modpack-${id}-action">${txt}</button>`
    const removeButton = `<button class="btn btn-outline-danger remove-button" id="modpack-${id}-remove">
            <i class="bi bi-trash-fill remove" /> Uninstall </button>`

    div.innerHTML = `${actionButton} ${installed ? removeButton : ""}`;

    const actionElement = div.querySelector(".card-action-btn") as HTMLElement;
    const removeElement = div.querySelector(".remove-button") as undefined | HTMLElement

    addButtonAction(id, actionElement, installed, config)
    removeElement?.addEventListener("click", () => {
        const res = ipcRenderer.sendSync("uninstall_prompt");

        logger.debug("Uninstall prompt", res)
        if(typeof res !== "boolean")
            return alert("Invalid return value from uninstall prompt")

        if (!res)
            return

        setLock(true)
        ipcRenderer.send("remove_modpack", id);
        ipcRenderer.on("remove_modpack_success", () => updateModpacks(true));
        ipcRenderer.on("remove_modpack_error", (_, e) => {
            alert(`Error uninstalling ${e.stack ?? e.message ?? e}`)
            updateModpacks(true);
        });
    })

    return div
}


function updateStatus(id: string, status: string) {
    const modpack = document.getElementById(`modpack-${id}`) as HTMLDivElement;
    const statusDiv = modpack.querySelector(".card-status") as HTMLDivElement;
    const text = modpack.querySelector(".card-status-span") as HTMLSpanElement;

    if (status === null) {
        text.innerText = ""
        return statusDiv.style.display = "none";
    }

    statusDiv.style.display = "";
    text.innerText = status;
}