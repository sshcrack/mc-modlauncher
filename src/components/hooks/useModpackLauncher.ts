import { useToast } from '@chakra-ui/react';
import { ModpackInfo } from '../../interfaces/modpack';
import { RenderLogger } from '../../interfaces/renderLogger';

const logger = RenderLogger.get("Components", "Hooks", "useModpackLauncher")
export function useModpackLauncher(id: string, config: ModpackInfo) {
    const toast = useToast()
    const { launcher, modpack } = window.api

    const launch = async () => {
        const installed = await modpack.isInstalled(id)

        logger.debug("Launching modpack", id, "with config", config, "installed", installed)
        if(!installed)
            toast({
                title: "Modpack not installed",
                description: "You must install the modpack before launching it",
                status: "error"
            })

        if(!config)
            toast({
                title: "No config",
                description: "Could not obtain modpack config. Please restart.",
                status: "error"
            })

        if(!installed || !config)
            return

        return launcher.launch(id, config)
    }

    return { launch }
}