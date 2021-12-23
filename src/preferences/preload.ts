import { ipcRenderer } from 'electron';
import prettyBytes from "../assets/pretty-bytes";
import { Logger } from '../interfaces/logger';

const logger = Logger.get("Preferences", "Preload")
document.addEventListener("DOMContentLoaded", () => {
    //setMemory()
    //setInstall();
    setCacheRemove();
    setOpenFolder()

    //const btn = document.getElementById("save")
    //btn.addEventListener("click", () => saveThings())
})

function setMemory() {
    const slider = document.getElementById("memory-range") as HTMLInputElement;
    const curr = document.getElementById("memory");

    const total = ipcRenderer.sendSync("get_mem");
    let settingsMem = ipcRenderer.sendSync("get_pref", "memory");

    logger.debug("Memory is", settingsMem, "total", total);
    if (isNaN(settingsMem)) {
        alert("Invalid memory value, defaulting to half")
        settingsMem = total / 2;

        ipcRenderer.sendSync("save_pref", "memory", settingsMem);
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


    const currDir = ipcRenderer.sendSync("get_pref", "install_dir");
    input.value = currDir;

    btn.addEventListener("click", () => {
        const id = Math.random()
        ipcRenderer.send("select_folder", id, currDir),

        ipcRenderer.on("select_folder_reply", (e, innerID, folder) => {
            if(innerID !== id || !folder)
                return;

            input.value = folder;
        })
    });
}

function saveThings() {
    const input = document.querySelector("#installdir") as HTMLInputElement;
    const main = document.querySelector("#center") as HTMLDivElement
    const saving = document.querySelector("#saving") as HTMLDivElement
    const exists = ipcRenderer.sendSync("exists_folder", input.value)

    if(!exists) {
        alert(`Install Directory does not exist. Not saving.`);
        return;
    }

    const memEl = document.querySelector("#memory-range") as HTMLInputElement;
    const mem = memEl.value;

    main.style.display = "none";
    saving.style.display = ""

    ipcRenderer.sendSync("save_pref", "install_dir", input.value);
    ipcRenderer.sendSync("save_pref", "memory", parseInt(mem));

    ipcRenderer.sendSync("close_prefs");
}

function setCacheRemove() {
    const btn = document.querySelector("#cache-clear") as HTMLButtonElement;
    const wait = document.querySelector("#wait") as HTMLDivElement;

    btn.addEventListener("click", () => {
        ipcRenderer.once("clear_cache_reply", (_, size) => {
            wait.style.display = "none"
            alert(`Cache with a total of ${size} cleared.`)
        })

        wait.style.display = ""
        ipcRenderer.send("clear_cache")
    })
}

function setOpenFolder() {
    const btn = document.querySelector("#open-folder") as HTMLButtonElement;

    btn.addEventListener("click", () => {
        logger.info("Sending opening signal")
        ipcRenderer.send("open_folder")
    })
}