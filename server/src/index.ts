import https from "https"

import express from "express"

const { API_KEY } = process.env
const app = express()
const curseforgeHost = "api.curseforge.com"

const apiPrefix = "/api/"
app.use(apiPrefix + "*", (req, res) => {
    const path = req.originalUrl.substring(apiPrefix.length)

    const httpReq = https.request({
        method: req.method,
        path: path,
        port: 443,
        host: curseforgeHost,
        headers: {
            ...req.headers,
            "x-api-key": API_KEY
        }
    }, hRes => {
        res = res.writeHead(hRes.statusCode, hRes.headers);
        hRes.on("data", c => res.write(c))
        hRes.on("end", () => res.end())
        hRes.on("error", c => {
            console.error(c)
            res.send("Error")
        })
    })

    if (req.method === "POST")
        httpReq.write(req.body)

    httpReq.on("error", err => {
        console.error(err)
        res.status(500).send("Error processing")
    })
})

app.listen(8080, () => console.log("Listening on 8080"))