import { Box, Button, IconButton, Spinner, Text, Tooltip, useColorModeValue, useToast } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { FaTrash } from "react-icons/fa";
import { Globals } from '../../../Globals';
import { RenderGlobals } from '../../../Globals/renderGlobals';
import { ModpackInfo } from '../../../interfaces/modpack';
import { RenderLogger } from '../../../interfaces/renderLogger';
import { useModpackLauncher } from '../../hooks/useModpackLauncher';
import useModpackManager from '../../hooks/useModpackManager';
import PercentButton from './PercentButton';

const logger = RenderLogger.get("components", "Modpack", "Buttons", "PlayButtons")
export default function PlayButtons({ config, id }: { config: ModpackInfo, id: string }) {
    const { launch } = useModpackLauncher(id, config)
    const { remove, processing, progress, update } = useModpackManager(id)
    const [isLaunching, setLaunching] = useState(false)
    const toast = useToast()
    const hasLatest = RenderGlobals.hasLatest(id, config)
    const { updateRequired } = config ?? {}


    const onLaunchClick = useCallback(() => {
        if (isLaunching)
            return;

        setLaunching(true)
        launch()
            .catch(e => {
                logger.error("Could not launch modpack", e?.stack ?? e)
                toast({
                    title: "Could not launch modpack",
                    description: `${e.message ?? e}`,
                    duration: 20000,
                    status: "error"
                })
            })
            .finally(() => setLaunching(false))
    }, [isLaunching])

    const onRemove = () => {
        remove()
    }

    const onUpdate = () => {
        const lastVer = Globals.getLastVersion(config.versions)
        if(processing)
            return

        update(lastVer)
    }

    const bgRemove = useColorModeValue("red.400", "red.700")
    const hoverRemove = useColorModeValue("red.300", "red.800")
    const tooltipColor = useColorModeValue("black", "white")


    const bgPlay = "green.500"
    const hoverPlay = "green.400"

    const bgUpdate = "orange.500"
    const hoverUpdate = "orange.400"

    const launchBtn = <Button
        flex='.75'
        bg={bgPlay}
        _hover={{ bg: hoverPlay }}
        onClick={onLaunchClick}
        loadingText='Launching...'
        isLoading={isLaunching}
    >Play</Button>

    const updateBtn = <PercentButton
        bg={bgUpdate}
        hover={hoverUpdate}
        onClick={onUpdate}
        processing={processing}
        progress={progress}
    >
        <Text>Update</Text>
    </PercentButton>

    const btnToUse = updateRequired ?
        hasLatest ? launchBtn : updateBtn
        :
        <>
            {launchBtn}
            <Box flex='.1'></Box>
            {updateBtn}
        </>

    return processing ?
        <Spinner /> : <>
            {btnToUse}
            <Box flex='.1'></Box>
            <Tooltip label='Remove' bg={bgRemove} color={tooltipColor} rounded='sm'>
                <IconButton flex='.25' bg={bgRemove} _hover={{ bg: hoverRemove }} icon={<FaTrash />} aria-label='Remove' onClick={onRemove} />
            </Tooltip>
        </>
}