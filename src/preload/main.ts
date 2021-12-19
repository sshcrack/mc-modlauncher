import { app, ipcRenderer } from 'electron';
import { Modpack } from '../interfaces/modpack';
import { getInstalled } from './instance';
import path from "path"

const base = "https://mc.sshbot.ddnss.de"
const listUrl = `${base}/list.json`

export async function handleIndex() {
    await processModpacks();
    await addPrefAction();
}

async function addPrefAction() {
    const prefBtn = document.getElementById("settings");
    prefBtn.addEventListener("click", () => {
        console.log("Sending opening signal...")
        ipcRenderer.send("open_prefs");
    });
}

async function processModpacks() {
    const modpacks = document.getElementById("modpacks")
    const list: string[] = await fetch(listUrl).then(e => e.json()).catch(() => alert("Could not list modpacks"));

    const infos = await Promise.all(
        list.map(id => fetch(`${base}/${id}/config.json`).then(async e => {
            const json: Modpack = await e.json();
            return {
                id: id,
                ...json
            }
        }))
    )

    const installed = await getInstalled();
    const childrenProms = infos.map(async ({ name, cover, author, description, id }) => {
        const cardDiv = document.createElement("div");

        const imgUrl = `${base}/${id}/${cover}`
        const isInstalled = installed.some(e => path.basename(e) === id);


        const boolToStr = isInstalled ? "1" : "0";

        cardDiv.setAttribute("data-id", id);
        cardDiv.setAttribute("data-installed", boolToStr);

        cardDiv.className = "card modpack";
        cardDiv.innerHTML = `
            <img src="${imgUrl}" class="card-img-top" alt="Modpack cover">
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <h6 class="card-subtitle mb-2 text-muted">by ${author}</h6>
                <p class="card-text">${description}</p>
                <div class="card-bottom card-center">
                    ${getButton(isInstalled, id).outerHTML}
                </div>
            </div>
        `

        return cardDiv
    })

    const children = await Promise.all(childrenProms);
    const sorted = children.sort((a, b) => {
        const firstInstalled = a.getAttribute("data-installed") === "1";
        const secondInstalled = b.getAttribute("data-installed") === "1";

        const toNumber = (e: boolean) => e ? 1 : 0;
        const fNumb = toNumber(firstInstalled);
        const sNumb = toNumber(secondInstalled);

        return fNumb - sNumb;
    })
    modpacks.append(...sorted);

    addButtonEvents()
}

function addButtonEvents() {
    const allModpacks = document.querySelectorAll(".modpack");

    allModpacks.forEach(e => {
        const id = e.getAttribute("data-id");
        const strInstalled = e.getAttribute("data-installed");

        if(!id || !strInstalled) {
            e.remove();
            return;
        }

        const installed = strInstalled === "1";
        const btn = document.getElementById(`modpack-${id}-action`)

        btn.addEventListener("click", () => {
            console.log("Clicked installed", installed, "id", id);

            const parent = btn.parentElement;
            if(!installed) {
                ipcRenderer.send("install_modpack", id);
                btn.remove();

                const progress = document.createElement("div");
                progress.className = "progress";
                progress.id = `install-progress-${id}`

                progress.innerHTML = `<div class="progress-bar" style="width: 0%" role="progressbar">0%</div>`

                parent.appendChild(progress)
                const bar = progress.querySelector(".progress-bar") as unknown as HTMLElement

                ipcRenderer.on("install_modpack_update", (_, innerId, percentage) => {
                    if (id !== innerId)
                        return;

                    const perStr = `${percentage * 100}%`

                    bar.style.width = perStr;
                    bar.innerText = `${percentage * 100}%`;
                })

                ipcRenderer.on("install_modpack_success", (_, innerId) => {
                    if(id !== innerId)
                        return;


                    progress.remove();
                    const btn = getButton(true, id);

                    parent.appendChild(btn);
                })

                ipcRenderer.on("install_modpack_error", (e, innerId, error) => {
                    if(id !== innerId)
                        return;

                    alert(`Error installing modpack ${innerId}: ${error}. Please restart to avoid errors.`)
                })
            }
        })
    })
}

function getButton(installed: boolean, id: string) {
    const txt = installed ? "Play" : "Install"
    const classBtn = installed ? "btn-open" : "btn-install"

    const a = document.createElement("a");
    a.href = "#"
    a.className = `btn btn-primary card-action ${classBtn}`
    a.id = `modpack-${id}-action`
    a.innerText = txt;

    return a
}