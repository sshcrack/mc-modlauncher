import { Box, Button, IconButton, Tooltip, useColorModeValue, useToast } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { FaTrash } from "react-icons/fa";
import { ModpackInfo } from '../../../interfaces/modpack';
import { RenderLogger } from '../../../interfaces/renderLogger';
import { useModpackLauncher } from '../../hooks/useModpackLauncher';

const logger = RenderLogger.get("components", "Modpack", "Buttons", "PlayButtons")
export default function PlayButtons({ config, id }: { config: ModpackInfo, id: string }) {
    const { launch } = useModpackLauncher(id, config);
    const toast = useToast()
    const [isLaunching, setLaunching] = useState(false)

    const onLaunchClick = useCallback(() => {
        if (isLaunching)
            return;

        setLaunching(true)
        launch()
        .catch(e => {
            logger.error(e)
            toast({
                title: "Could not launch modpack"
            })
        })
        .finally(() => setLaunching(false))
    }, [isLaunching])

    const bgRemove = useColorModeValue("red.400", "red.700")
    const hoverRemove = useColorModeValue("red.300", "red.800")
    const tooltipColor = useColorModeValue("black", "white")


    const bgPlay = useColorModeValue("green.500", "green.500")
    const hoverPlay = useColorModeValue("green.400", "green.400")

    return <>
        <Button
            flex='.75'
            bg={bgPlay}
            _hover={{ bg: hoverPlay }}
            onClick={onLaunchClick}
            loadingText='Launching...'
            isLoading={isLaunching}
        >Play</Button>
        <Box flex='.1'></Box>
        <Tooltip label='Remove' bg={bgRemove} color={tooltipColor} rounded='sm'>
            <IconButton flex='.25' bg={bgRemove} _hover={{ bg: hoverRemove }} icon={<FaTrash />} aria-label='Remove' />
        </Tooltip>
    </>
}