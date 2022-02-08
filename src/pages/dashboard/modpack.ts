import { RenderLogger } from '../../interfaces/renderLogger';
import { Globals } from '../../Globals';
import { Modpack } from '../../interfaces/modpack';
import { getButtonDiv } from './scripts/buttons';
import { Logger } from 'sass';

const { baseUrl } = Globals
const listUrl = `${baseUrl}/list.json`

let locked = false

const { modpack } = window.api
const logger = RenderLogger.get("Dashboard", "Modpack")

export async function updateModpacks(releaseLock?: boolean) {
    logger.debug("Updating modpacks...")
    if (releaseLock)
        setLock(false)

    if (locked)
        return logger.debug("Modpack is locked, returning");

    logger.debug("Requiring lock...")
    setLock(true)
    const modpacks = document.getElementById("modpacks")

    const list: string[] = await fetch(listUrl, { method: "GET" }).then(e => e.json()).catch(e => logger.error("Could not fetch list", e))
    if (!list) {
        setLock(false);
        setTimeout(() => {
            updateModpacks();
        }, 2000)

        return;
    }

    logger.debug("Fetching list...")
    const infos = await Promise.all(
        list.map(id => fetch(`${baseUrl}/${id}/config.json`).then(async e => {
            const json: Modpack = await e.json();
            return {
                id: id,
                ...json
            }
        }))
    )

    logger.debug("Get installed...")
    const installed = modpack.list()
    const childrenProms = infos.map(async (config) => {
        const { name, cover, author, description, id } = config
        const cardDiv = document.createElement("div");

        const imgUrl = `${baseUrl}/${id}/${cover}`
        const isInstalled = installed.some(e => e.split("\\").pop().split("/").pop() === id);

        const boolToStr = isInstalled ? "1" : "0";

        cardDiv.setAttribute("data-id", id);
        cardDiv.id = "modpack-" + id;
        cardDiv.setAttribute("data-installed", boolToStr);

        cardDiv.className = "card modpack";
        cardDiv.innerHTML = `
            <div class="card-status" style="display:none;">
                <div>
                    <span class="card-status-span"></span>
                </div>
            </div>
            <div class="card-main">
                <img src="${imgUrl}" class="card-img-top" alt="Modpack cover">
                <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">by ${author}</h6>
                    <p class="card-text">${description}</p>
                    <div class="card-bottom card-center">
                    </div>
                </div>
            </div>
        `

        const buttonDiv = getButtonDiv(id, isInstalled, config);

        cardDiv.querySelector(".card-main .card-body .card-bottom").append(buttonDiv)
        return cardDiv
    })

    logger.debug("Awaiting child proms...")
    const children = await Promise.all(childrenProms);
    const sorted = children.sort((a, b) => {
        const firstInstalled = a.getAttribute("data-installed") === "1";
        const secondInstalled = b.getAttribute("data-installed") === "1";

        const toNumber = (e: boolean) => e ? 1 : 0;
        const fNumb = toNumber(firstInstalled);
        const sNumb = toNumber(secondInstalled);

        return sNumb - fNumb;
    })

    modpacks.innerHTML = "";
    modpacks.append(...sorted);
    setLock(false)
    logger.debug("Lock set to false.")
}


export function setLock(lock: boolean) {
    locked = lock
}