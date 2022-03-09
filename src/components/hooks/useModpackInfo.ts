import { useState } from 'react';
import { Version } from '../../interfaces/modpack';

export function useModpackInfo(id: string) {
    const [ installed, setInstalled] = useState<boolean | undefined>(undefined)
    const [ version, setVersion ] = useState<Version | null | undefined>(undefined)

    const { modpack } =  window.api;
    if(installed === undefined) {
        console.log("Modpack info null, refreshing")
        setInstalled(modpack.isInstalled(id) ?? false);
    }

    if(version === undefined) {
        console.log("Version Info null, getting")
        setVersion(modpack.version(id) ?? null);
    }

    return { version, installed}
}