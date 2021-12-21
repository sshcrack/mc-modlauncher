import { store } from '../preferences/renderer';

export class MainGlobals {
    static getInstallDir(): string {
        return store.get("install_dir")
    }
}