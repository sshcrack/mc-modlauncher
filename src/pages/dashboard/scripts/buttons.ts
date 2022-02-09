import { Progress } from '../../../backend/InstallManager/event/interface';
import { RenderGlobals } from '../../../Globals/renderGlobals';
import { RenderLogger } from '../../../interfaces/renderLogger';
import { ModpackInfo } from '../../../interfaces/modpack';
import { setLock, updateModpacks } from '../modpack';
import { Globals } from '../../../Globals';

const logger = RenderLogger.get("Preload", "Buttons")

const { launcher, modpack, system } = window.api
const { prompt } = system
export function addButtonAction(id: string, btn: HTMLElement, installed: boolean, config: ModpackInfo) {
    btn.addEventListener("click", async () => {
        const newestVersion = RenderGlobals.hasLatest(id, config)


        if (installed && newestVersion) {
            logger.info("Launching", id)
            await launcher.launch(id, config)

            logger.info("Launched successfully.")
            return;
        }

        setLock(true)

        const parent = btn.parentElement;
        parent.childNodes.forEach(e => e.remove())

        const progress = document.createElement("div");
        progress.className = "progress";
        progress.id = `install-progress-${id}`

        progress.innerHTML = `<div class="progress-bar" style="width: 0%" role="progressbar">0%</div>`

        parent.appendChild(progress)
        const bar = progress.querySelector(".progress-bar") as unknown as HTMLElement

        const onError = (id: string, error: Error) => {
            updateStatus(id, null)

            const err = error?.stack ?? error?.message ?? error;
            logger.error(err);
            prompt.error(`Error installing modpack ${id}: ${err}. Please restart to avoid errors.`)
        }

        const onUpdate = ({ percent, status }: Progress) => {
            const perStr = `${Math.round(percent * 100)}%`
            updateStatus(id, status)

            bar.style.width = perStr;
            bar.innerText = perStr;
        }

        const shouldUpdate = !newestVersion
        const prom = shouldUpdate ? modpack.update(id, onUpdate, Globals.getLastVersion(config)) : modpack.install(id, onUpdate, Globals.getLastVersion(config))
        prom
            .catch(err => onError(id, err))
            .finally(() => updateModpacks(true))
    })
}

export function getButtonDiv(id: string, installed: boolean, config: ModpackInfo) {
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
        const res = prompt.uninstall()

        logger.debug("Uninstall prompt", res)
        if (typeof res !== "boolean")
            return alert("Invalid return value from uninstall prompt")

        if (!res)
            return

        setLock(true)
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        modpack.remove(id, () => {})
            .catch((e: Error) => {
                const str = e?.stack ?? e?.message ?? e
                logger.error(str)
                prompt.error(`Error uninstalling modpack ${id}: ${str}`)
            })
            .finally(() => {
                logger.debug("Uninstalled modpack", id)
                updateModpacks(true)
            })
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