import { useEffect, useState } from 'react';
import { Version } from '../../interfaces/modpack';

export function useModpackInfo(id: string) {
    const [ installed, setInstalled] = useState<boolean | undefined>(undefined)
    const [ version, setVersion ] = useState<Version | null | undefined>(undefined)

    const { modpack } =  window.api;
    useEffect(() => {
        modpack.isInstalled(id).then(res => {
            setInstalled(res);
        })
    }, [])

    if(version === undefined) {
        console.log("Version Info null, getting")
        setVersion(modpack.version(id) ?? null);
    }

    return { version, installed}
}