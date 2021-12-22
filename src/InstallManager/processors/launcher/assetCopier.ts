import path from "path";
import { ProcessEventEmitter } from '../../event/Processor';
import { getLauncherDir } from './file';
import fs from "fs-extra"

export class AssetCopier extends ProcessEventEmitter{
    public async run() {
        this.emit("progress", { percent: 0, status: "Copying assets..." })

        const { APPDATA } = process.env;
        const oldAssetsDir = path.join(APPDATA, ".minecraft", "assets");
        const assetDir = path.join(getLauncherDir());

        await fs.copy(oldAssetsDir, assetDir)
    }

}