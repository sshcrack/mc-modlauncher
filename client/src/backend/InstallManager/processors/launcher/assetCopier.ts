import path from "path";
import { ProcessEventEmitter } from '../../event/Processor';
import { getLauncherDir } from './file';
import fs from "fs-extra"

export class AssetCopier extends ProcessEventEmitter {
    public async run() {
        this.emit("progress", { percent: 0, status: "Copying assets..." })

        const { APPDATA } = process.env;
        const oldAssetsDir = path.join(APPDATA, ".minecraft", "assets");
        const assetDir = path.join(getLauncherDir());

        const toCopy = [
            "objects",
            "indexes"
        ]

        const single = 1 / toCopy.length
        let i = 0;
        for (const folder of toCopy) {
            const progress = i * single;
            this.emit("progress", { percent: progress, status: `Copying ${folder}...` })

            const source = path.join(oldAssetsDir, folder)
            const dest = path.join(assetDir, folder)
            if(!fs.existsSync(source))
                continue;

            await fs.copy(source, dest)
            i++
        }
    }

}