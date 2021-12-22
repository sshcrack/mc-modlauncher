import fs from "fs";
import got from 'got/dist/source';
import { Globals } from '../../../../../Globals';
import { MainGlobals } from '../../../../../Globals/mainGlobals';
import { Modpack } from '../../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../../event/Processor';
import { InstallProfile } from '../../../../General/installProfile';
import { getForgeInstallProfile } from '../../../../General/mcBase';
import { SharedProcessor } from '../interface';
import { getClassPathJar } from './file';
import { SinglePatcher } from './SinglePatcher';

export class MainPatcher extends ProcessEventEmitter {
    private shared: SharedProcessor;

    constructor(id: string, config: Modpack, options: AdditionalOptions, shared: SharedProcessor) {
        super(id, config, options);
        this.shared = shared;
    }

    public async run() {
        this.emit("progress", { percent: 0, status: "Getting argument maps..." })

        const installDir = MainGlobals.getInstallDir()
        const profilePath = getForgeInstallProfile(installDir, this.id, this.config)

        const installProfileRaw = fs.readFileSync(profilePath, "utf-8");
        const installProfile: InstallProfile = JSON.parse(installProfileRaw);

        const processors = installProfile.processors
            .filter(e => !e.sides || e.sides.includes("client"))
            .map(e => new SinglePatcher(this.id, this.config, {
                ...this.options,
                ...e
            }, this.shared))

        const url = `${Globals.baseUrl}/classpath.jar`
        const jarPath = getClassPathJar();

        const res = await got(url);
        fs.writeFileSync(jarPath, res.rawBody);

        await ProcessEventEmitter.runMultiple(processors, prog => this.emit("progress", prog))
    }
}
