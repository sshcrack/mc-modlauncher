import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"
import "../theme.scss"
import "./index.scss"
import { addButtonListeners } from './scripts/buttonts'


const { preferences } = window.api

document.addEventListener("DOMContentLoaded", () => {
    addButtonListeners();

    const btn = document.getElementById("save")
    btn.addEventListener("click", () => save())
})


function save() {

    const main = document.querySelector("#center") as HTMLDivElement
    const saving = document.querySelector("#wait") as HTMLDivElement

    const memEl = document.querySelector("#memory-range") as HTMLInputElement;
    const mem = memEl.value;

    main.style.display = "none";
    saving.style.display = ""

    preferences.set("memory", parseInt(mem));
    preferences.close();
}