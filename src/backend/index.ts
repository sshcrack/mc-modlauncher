import { ipcRenderer } from 'electron';
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


        const txt = isInstalled ? "Play" : "Install"
        const classBtn = isInstalled ? "btn-open" : "btn-install"
        const boolToStr = isInstalled ? "0" : "1";

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
                    <a href="#" class="btn btn-primary disabled card-action ${classBtn}">${txt}</a>
                </div>
            </div>
        `

        return cardDiv
    })

    const children = await Promise.all(childrenProms);
    modpacks.append(...children);
}