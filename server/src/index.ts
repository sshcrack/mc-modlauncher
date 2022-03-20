import https from "https"

import express from "express"

const { API_KEY } = process.env
const app = express()
const curseforgeHost = "api.curseforge.com"

const apiPrefix = "/api/"

app.use(express.json());
app.use(apiPrefix + "*", (req, res) => {
  const path = req.originalUrl.substring(apiPrefix.length -1)
  console.log("Requesting", curseforgeHost, "with path", path, "method", req.method)

  const headersToSend = Object.assign({}, req.headers)
  delete headersToSend.host
  delete headersToSend.connection
  delete headersToSend.origin

  const bodyWrite =typeof req.body === "object" ? JSON.stringify(req.body) : req.body
  if(typeof bodyWrite !== "string") {
    res.status(401).send("Body must be a string/json")
    return
  }

  if(req.method === "POST")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    headersToSend["Content-Length"] = bodyWrite.length as any

  const httpReq = https.request({
    method: req.method,
    path: path,
    hostname: curseforgeHost,
    headers: {
      ...headersToSend,
      "x-api-key": API_KEY,
    }
  }, hRes => {
    res = res.writeHead(hRes.statusCode, hRes.headers);

    hRes.on("data", d => res.write(d))
    hRes.on("end", () => res.end())

    hRes.on("error", c => {
      console.error(c)
      res.send("Error")
    })
  })

  httpReq.on("error", err => {
    console.error(err)
    res.status(500).send("Error processing")
  })


  if (req.method === "POST")
    httpReq.write(bodyWrite)

  httpReq.end()
})

const listenTo = parseInt(process.env.PORT ?? "8080")
app.listen(listenTo, () => console.log("Listening on", listenTo))
