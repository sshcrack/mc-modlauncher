import { Modpack } from '../../../../interfaces/modpack';
import { AdditionalOptions, ProcessEventEmitter } from '../../../event/Processor';
import { SharedMap } from '../../interface';
import { ArgumentGetter } from './ArgumentGetter';
import { SharedProcessor } from './interface';
import { MainPatcher } from './patcher/MainPatcher';

//const logger = Logger.get("InstallManager", "PostProcessors", "PostProcessor")
export class PostProcessor extends ProcessEventEmitter {
    private shared: SharedMap;

    constructor(id: string, config: Modpack, options: AdditionalOptions, shared: SharedMap) {
        super(id, config, options);
        this.shared = shared;
    }

    public async run() {
        const sharedMap: SharedProcessor = Object.assign(this.shared);
        const processors = [
            ArgumentGetter,
            MainPatcher
        ].map(e => new e(this.id, this.config, this.options, sharedMap));

        await ProcessEventEmitter.runMultiple(processors, prog => {
            this.emit("progress", prog);
        })
    }
}