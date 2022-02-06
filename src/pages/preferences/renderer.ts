import prettyBytes from "pretty-bytes"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"
import "bootstrap-icons/font/bootstrap-icons.css"
import "../theme.scss"
import "./index.scss"

import { RenderLogger } from '../../interfaces/renderLogger';

const logger = RenderLogger.get("Preferences", "Preload")

const { api } = window
const { preferences, system, cache, folder } = api

document.addEventListener("DOMContentLoaded", () => {
    setMemory()
    //setInstall();
    setCacheRemove();
    setOpenFolder()

    const btn = document.getElementById("save")
    btn.addEventListener("click", () => saveThings())
})

function setMemory() {
    const slider = document.getElementById("memory-range") as HTMLInputElement;
    const curr = document.getElementById("memory");

    const total = system.memory();
    let settingsMem = preferences.get("memory")

    logger.debug("Memory is", settingsMem, "total", total);
    if (isNaN(settingsMem)) {
        alert("Invalid memory value, defaulting to half")
        settingsMem = total / 2;

        preferences.set("memory", settingsMem)
    }

    const asInt = parseInt(settingsMem);

    setTimeout(() => slider.value = asInt as unknown as string, 200)
    slider.max = total as unknown as string;

    const update = (e: number) => curr.innerText = prettyBytes(e, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    slider.addEventListener("input", (e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const { value } = e.target;

        update(parseInt(value));
    })

    update(parseInt(settingsMem))
}

function setInstall() {

    const btn = document.querySelector("#browse")
    const input = document.querySelector("#installdir") as HTMLInputElement;


    const currDir = preferences.get("install_dir");
    input.value = currDir;

    btn.addEventListener("click", async () => {
        input.value = await folder.select(currDir);
    });
}

function saveThings() {
    const { set: setPref, close: closePref } = api.preferences;

    const main = document.querySelector("#center") as HTMLDivElement
    const saving = document.querySelector("#wait") as HTMLDivElement

    const memEl = document.querySelector("#memory-range") as HTMLInputElement;
    const mem = memEl.value;

    main.style.display = "none";
    saving.style.display = ""

    setPref("memory", parseInt(mem));
    closePref();
}

function setCacheRemove() {
    const btn = document.querySelector("#cache-clear") as HTMLButtonElement;
    const wait = document.querySelector("#wait") as HTMLDivElement;

    btn.addEventListener("click", async () => {
        wait.style.display = ""
        const cleared = await cache.clear();

        wait.style.display = "none"
        alert(`Cache with a total of ${cleared} cleared.`)
    })
}

function setOpenFolder() {
    const btn = document.querySelector("#open-folder") as HTMLButtonElement;

    btn.addEventListener("click", () => {
        logger.info("Sending opening signal")
        folder.open();
    })
}