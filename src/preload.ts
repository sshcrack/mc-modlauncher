import { handleIndex } from './preload/main';

window.onload = async () => {
    const doc = document.getElementById("page-index");
    if (doc)
        return await handleIndex();
}