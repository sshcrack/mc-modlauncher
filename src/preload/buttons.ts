import { ipcRenderer } from 'electron';
import { Globals } from '../Globals';
import { Logger } from '../interfaces/logger';
import { updateModpacks } from './modpack';

const logger = Logger.get("Preload", "Buttons")

export function addButtonAction(id: string, btn: HTMLElement, installed: boolean) {
    btn.addEventListener("click", async () => {
        logger.info("Clicked button to installed, info: ", installed, "id", id);

        const parent = btn.parentElement;
        if (!installed) {
            updateStatus(id, "Sending install signal...")
            ipcRenderer.send("install_modpack", id);
            btn.remove();

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


                updateStatus(id, null)
                progress.remove();
                const btn = getButtonDiv(id, true);

                parent.appendChild(btn);
                updateModpacks();
            })

            ipcRenderer.on("modpack_error", (e, innerId, error) => {
                if (id !== innerId)
                    return;

                updateStatus(id, null)
                const err = error?.stack ?? error?.message ?? error;
                logger.error(err);
                alert(`Error installing modpack ${innerId}: ${err}. Please restart to avoid errors.`)

                updateModpacks();
            })
        } else {
            const baseUrl = Globals.baseUrl;
            const config = await fetch(`${baseUrl}/${id}/config.json`)
                .then(e => e.json())
                .catch(e => alert("Error " + e))

            ipcRenderer.send("launch_mc", id, config)
        }
    })
}

export function getButtonDiv(id: string, installed: boolean) {
    const txt = installed ? "Play" : "Install"
    const classBtn = installed ? "btn-open" : "btn-install"

    const div = document.createElement("div");
    div.className = "card-action";

    const actionButton = `<a class="btn btn-primary ${classBtn} card-action-btn" href="#" id="modpack-${id}-action">${txt}</a>`
    const removeButton = `<button class="btn btn-outline-danger remove-button" id="modpack-${id}-remove">
            <i class="bi bi-trash-fill remove" /> Uninstall </button>`

    div.innerHTML = `${actionButton} ${installed ? removeButton : ""}`;

    const actionElement = div.querySelector(".card-action-btn") as HTMLElement;
    const removeElement = div.querySelector(".remove-button") as undefined | HTMLElement

    addButtonAction(id, actionElement, installed)
    removeElement?.addEventListener("click", () => {
        const res = ipcRenderer.sendSync("uninstall_prompt");

        if (!res)
            return

        ipcRenderer.send("remove_modpack", id);
        ipcRenderer.on("remove_modpack_success", () => updateModpacks());
        ipcRenderer.on("remove_modpack_error", (_, e) => {
            alert(`Error uninstalling ${e.stack ?? e.message ?? e}`)
            updateModpacks();
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