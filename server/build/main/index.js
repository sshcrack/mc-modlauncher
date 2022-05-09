"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const { API_KEY } = process.env;
const app = (0, express_1.default)();
const curseforgeHost = "api.curseforge.com";
const apiPrefix = "/api/";
app.use(express_1.default.json());
app.use(apiPrefix + "*", (req, res) => {
    const path = req.originalUrl.substring(apiPrefix.length - 1);
    console.log("Requesting", curseforgeHost, "with path", path, "method", req.method);
    const headersToSend = Object.assign({}, req.headers);
    delete headersToSend.host;
    delete headersToSend.connection;
    delete headersToSend.origin;
    const bodyWrite = typeof req.body === "object" ? JSON.stringify(req.body) : req.body;
    if (typeof bodyWrite !== "string") {
        res.status(401).send("Body must be a string/json");
        return;
    }
    if (req.method === "POST")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        headersToSend["Content-Length"] = bodyWrite.length;
    const httpReq = https_1.default.request({
        method: req.method,
        path: path,
        hostname: curseforgeHost,
        headers: Object.assign(Object.assign({}, headersToSend), { "x-api-key": API_KEY })
    }, hRes => {
        res = res.writeHead(hRes.statusCode, hRes.headers);
        hRes.on("data", d => res.write(d));
        hRes.on("end", () => res.end());
        hRes.on("error", c => {
            console.error(c);
            res.send("Error");
        });
    });
    httpReq.on("error", err => {
        console.error(err);
        res.status(500).send("Error processing");
    });
    if (req.method === "POST")
        httpReq.write(bodyWrite);
    httpReq.end();
});
const listenTo = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "8080");
app.listen(listenTo, () => console.log("Listening on", listenTo));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsa0RBQXlCO0FBRXpCLHNEQUE2QjtBQUU3QixNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQTtBQUMvQixNQUFNLEdBQUcsR0FBRyxJQUFBLGlCQUFPLEdBQUUsQ0FBQTtBQUNyQixNQUFNLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQTtBQUUzQyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUE7QUFFekIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDeEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQ3BDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUUsQ0FBQyxDQUFDLENBQUE7SUFDM0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUVsRixNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDcEQsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFBO0lBQ3pCLE9BQU8sYUFBYSxDQUFDLFVBQVUsQ0FBQTtJQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUE7SUFFM0IsTUFBTSxTQUFTLEdBQUUsT0FBTyxHQUFHLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUE7SUFDbkYsSUFBRyxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7UUFDaEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtRQUNsRCxPQUFNO0tBQ1A7SUFFRCxJQUFHLEdBQUcsQ0FBQyxNQUFNLEtBQUssTUFBTTtRQUN0Qiw4REFBOEQ7UUFDOUQsYUFBYSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQWEsQ0FBQTtJQUUzRCxNQUFNLE9BQU8sR0FBRyxlQUFLLENBQUMsT0FBTyxDQUFDO1FBQzVCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtRQUNsQixJQUFJLEVBQUUsSUFBSTtRQUNWLFFBQVEsRUFBRSxjQUFjO1FBQ3hCLE9BQU8sa0NBQ0YsYUFBYSxLQUNoQixXQUFXLEVBQUUsT0FBTyxHQUNyQjtLQUNGLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDUixHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUUvQixJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtZQUNuQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ2hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDbkIsQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtJQUVGLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDbEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtJQUMxQyxDQUFDLENBQUMsQ0FBQTtJQUdGLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNO1FBQ3ZCLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUE7SUFFMUIsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFBO0FBQ2YsQ0FBQyxDQUFDLENBQUE7QUFFRixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksbUNBQUksTUFBTSxDQUFDLENBQUE7QUFDckQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQSJ9