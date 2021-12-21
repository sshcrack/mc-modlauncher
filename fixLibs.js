const child = require("child_process");
const fs = require("fs");
const path = require("path")

console.log("installing node typings")
const cwds = ["./node_modules/electron", "./node_modules/@types/signale", "./node_modules/got", "./node_modules/@types/responselike", "./node_modules/@types/keyv/", "./node_modules/@types/cacheable-request", "./node_modules/conf"]
cwds.forEach(e => {
    console.log("Installing in", path.basename(e))
    child.execSync(`npm i @types/node@latest`, {
        cwd: e
    })
})
