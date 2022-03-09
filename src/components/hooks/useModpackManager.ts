import { useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Progress } from '../../backend/InstallManager/event/interface';
import { Version } from '../../interfaces/modpack';
import { RenderLogger } from '../../interfaces/renderLogger';

const logger = RenderLogger.get("Components", "Hooks", "useModpackLauncher")
export default function useModpackManager(id: string) {
    const { modpack } = window.api;

    const toast = useToast()
    const [progress, setProgress] = useState<Progress>(null);
    const [processing, setProcessing] = useState(false)
    const [ version, setVersion ] = useState<Version>(() => modpack.version(id))
    const [installed, setInstalled] = useState(() => modpack.isInstalled(id))

    const updateVars = (processing: boolean) => {
        console.log("Updating Vars")
        setInstalled(modpack.isInstalled(id))
        setProcessing(processing)
        setVersion(modpack.version(id))
    }

    const defaultCheck = () => {
        if (processing)
            toast({
                title: "Processing",
                description: "Modpack is alread being processed",
                status: "warning"
            })

        return !processing
    }

    const update = (ver: Version) => {
        if (!defaultCheck())
            return

        updateVars(true)
        return modpack.update(id, prog => setProgress(prog), ver)
            .then(() => {
                updateVars(false)
            })
            .catch(e => {
                updateVars(false)

                logger.error("Error updating", id, e)
                toast({
                    title: `Error updating ${id}`,
                    description: e?.stack ?? e?.message ?? e
                })
            })
    }

    const install = (ver: Version) => {
        if (!defaultCheck())
            return

        updateVars(true)
        return modpack.install(id, prog => setProgress(prog), ver)
            .then(() => updateVars(false))
            .catch(e => {
                updateVars(false)
                logger.error("Error installing", id, e)
                toast({
                    title: `Error installing ${id}`,
                    description: e?.stack ?? e?.message ?? e
                })
            })
    }

    const remove = () => {
        if (!defaultCheck())
            return

        updateVars(true)
        modpack.remove(id, (prog) => setProgress(prog))
            .then(() => updateVars(false))
            .catch(e => {
                updateVars(false)

                logger.error("Error removing", id, e)
                toast({
                    title: `Error removing ${id}`,
                    description: e?.stack ?? e?.message ?? e
                })

            })
    }

    useEffect(() => {
        modpack.addProcessingListener(id, processing => {
            console.log("PRocessing listener")
            setInstalled(modpack.isInstalled(id))
            setProcessing(processing)
        })
    }, [ ])

    return { progress, processing, update, install, remove, installed, version }
}