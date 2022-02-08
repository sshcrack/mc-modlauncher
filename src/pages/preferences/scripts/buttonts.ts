import { RenderLogger } from '../../../interfaces/renderLogger';
import prettyBytes from "pretty-bytes"

const logger = RenderLogger.get("Preferences", "Preload", "Buttons")
const { preferences, system, folder, cache } = window.api
const { prompt } = system;

export function addButtonListeners() {
    setMemoryBtn();
    setCacheRemoveBtn();
    setOpenFolderBtn();
    setInstallDirBtn();
}

async function setMemoryBtn() {
    const slider = document.getElementById("memory-range") as HTMLInputElement;
    const curr = document.getElementById("memory");
    let settingsMem = preferences.get("memory")

    slider.disabled = true;
    const total = await system.memory();
    slider.disabled = false;

    logger.debug("Memory is", settingsMem, "total", total);
    if (isNaN(settingsMem)) {
        prompt.error("Invalid memory value, defaulting to half")
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

function setInstallDirBtn() {
    const btn = document.querySelector("#browse")
    const input = document.querySelector("#installdir") as HTMLInputElement;

    input.value = preferences.get("install_dir");
    btn.addEventListener("click", async () => {
        const run = async () => {
            const currDir = preferences.get("install_dir")
            const target = await folder.select(currDir);
            if (!target)
                return;

            logger.log("Getting folder size")
            const currSize = await folder.size(currDir);
            logger.log("Getting disk size")
            const { free: freeSpace } = await system.disk.size(target) ?? { free: NaN };
            logger.log("Processing", currSize, freeSpace)


            if (isNaN(currSize))
                return prompt.error("Could not get folder size")

            if (isNaN(freeSpace))
                return prompt.error("Could not get free disk size")


            const freePretty = prettyBytes(freeSpace);
            const currPretty = prettyBytes(currSize);
            if (freeSpace < currSize)
                return prompt.error(`Not enough free space to move files (Free: ${freePretty} Required: ${currPretty})`)

            logger.log(`Setting install dir to ${target}. Free Space is ${freePretty} (Raw: ${freeSpace}), required is ${currPretty} (Raw: ${currSize})`)
            input.value = target
        }

        setLoading(true)
        await run();

        setLoading(false)
    });
}


function setCacheRemoveBtn() {
    const btn = document.querySelector("#cache-clear") as HTMLButtonElement;

    btn.addEventListener("click", async () => {
        setLoading(true)
        const cleared = await cache.clear();

        setLoading(false);
        prompt.error(`Cache with a total of ${cleared} cleared.`)
    })
}


function setOpenFolderBtn() {
    const btn = document.querySelector("#open-folder") as HTMLButtonElement;

    btn.addEventListener("click", () => {
        logger.info("Sending opening signal")
        folder.open();
    })
}

function setLoading(loading: boolean) {
    const wait = document.querySelector("#wait") as HTMLDivElement;

    wait.style.display = loading ? "" : "none";
}