import { Box, Button, IconButton, Text, Tooltip, useColorModeValue, useToast } from '@chakra-ui/react';
import React, { useCallback, useRef, useState } from 'react';
import { FaTrash } from "react-icons/fa";
import { Globals } from '../../../Globals';
import { RenderGlobals } from '../../../Globals/renderGlobals';
import { ModpackInfo } from '../../../interfaces/modpack';
import { RenderLogger } from '../../../interfaces/renderLogger';
import { useModpackLauncher } from '../../hooks/useModpackLauncher';
import useModpackManager from '../../hooks/useModpackManager';
import PercentButton from './PercentButton';
import { VersionModal } from './VersionModal';

const logger = RenderLogger.get("components", "Modpack", "Buttons", "PlayButtons")
export default function PlayButtons({ config, id, onRemove }: { config: ModpackInfo, id: string, onRemove: () => void }) {
    const { launch } = useModpackLauncher(id, config)
    const selectRef = useRef<HTMLSelectElement>()
    const { remove, processing, progress, update } = useModpackManager(id)
    const [isLaunching, setLaunching] = useState(false)
    const [isOpen, setOpen] = useState(false)
    const [ hasLatest, setHasLatest] = useState(() => RenderGlobals.hasLatest(id, config))

    const toast = useToast()
    const { updateRequired } = config ?? {}

    const onClose = () => setOpen(false)

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

    const onUpdate = () => {
        onClose()
        const versionStr = selectRef.current?.value
        if (!versionStr)
            return


        const version = config.versions.find(e => e.id === versionStr)
        if (processing)
            return toast({
                status: "info",
                title: "Working",
                description: "Steve is already working for you. Please be patient til he finds diamonds"
            })

        update(version)
            .then(() => setHasLatest(RenderGlobals.hasLatest(id, config)))
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
        onClick={() => setOpen(true)}
        processing={processing}
        progress={progress}
    >
        <Text>Update</Text>
    </PercentButton>

    const btnToUse = updateRequired && !hasLatest ?
        updateBtn
        :
        !hasLatest ? <>
            {launchBtn}
            <Box flex='.1'></Box>
            {updateBtn}
        </> : launchBtn

    const allButtons = <>
        {btnToUse}
        <Box flex='.1'></Box>
        <Tooltip
            label='Remove'
            bg={bgRemove}
            color={tooltipColor}
            rounded='sm'
        >
            <IconButton
                flex='.25'
                bg={bgRemove}
                _hover={{ bg: hoverRemove }}
                icon={<FaTrash />}
                aria-label='Remove'
                onClick={() => {
                    remove()
                        .then(() => {
                            const { preferences } = window.api
                            const custom = preferences.get("custom_modpacks")
                                .filter((e: string) => e !== id)

                            preferences.set("custom_modpacks", custom)
                            onRemove();
                        })
                }}
            />
        </Tooltip>
    </>

    const lastVersion = Globals.getLastVersion(config.versions)
    const options = config.versions.map(({ id, mcVersion }) => {
        return <option value={id}>{id}{mcVersion ? " " + mcVersion : ""}</option>
    })

    return <>
        {processing ? updateBtn : allButtons}
        {VersionModal(isOpen, onClose, selectRef, lastVersion, options, onUpdate, "Update") }
    </>
}
