import { useState } from 'react';
import { Version } from '../../interfaces/modpack';

export function useModpackInfo(id: string) {
    const [ installed, setInstalled] = useState<boolean | undefined>(undefined)
    const [ version, setVersion ] = useState<Version | null | undefined>(undefined)

    const { modpack } =  window.api;
    if(installed === undefined)
        setInstalled(modpack.isInstalled(id) ?? false);

    if(version === undefined)
        setVersion(modpack.version(id) ?? null);

    return { version, installed}
}