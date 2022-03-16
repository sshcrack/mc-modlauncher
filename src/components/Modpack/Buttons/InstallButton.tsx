import { Text, useColorModeValue, useToast } from '@chakra-ui/react';
import React, { createRef, useEffect, useState } from 'react';
import { Globals } from '../../../Globals';
import { ModpackInfo } from '../../../interfaces/modpack';
import useModpackManager from '../../hooks/useModpackManager';
import PercentButton from './PercentButton';
import { VersionModal } from './VersionModal';

export default function InstallButtons({ config, id, onRecentInstall, autoInstall }: Props) {
    const { install, processing, progress } = useModpackManager(id)
    const [isOpen, setOpen] = useState(false)
    const toast = useToast()
    const selectRef = createRef<HTMLSelectElement>()


    const bgInstall = useColorModeValue("green.500", "green.500")
    const hoverInstall = useColorModeValue("green.400", "green.400")

    const lastVersion = Globals.getLastVersion(config)

    const options = config.versions.map(({ id, mcVersion }) => {
        return <option value={id} key={id + mcVersion}>{id}{mcVersion ? " " + mcVersion : ""}</option>
    })

    useEffect(() => {
        if(!autoInstall || !config.updateRequired)
            return

        const lastVer = Globals.getLastVersion(config.versions);
        install(lastVer)
            .then(() => onRecentInstall())
    }, [])

    const onClose = () => setOpen(false)

    const onInstall = () => {
        onClose()
        const versionStr = selectRef.current?.value
        if (!versionStr)
            return


        const version = config.versions.find(e => e.id === versionStr)
        if (processing)
            return toast({
                status: "info",
                title: "Working",
                description: "Steve is already working for you. Please be patient till he finds diamonds"
            })

        install(version)
            .then(() => onRecentInstall())
    }

    return <>
        <PercentButton
            bg={bgInstall}
            hover={hoverInstall}
            onClick={() => setOpen(true)}
            processing={processing}
            progress={progress}
        >
            <Text>Install</Text>
        </PercentButton>
        {VersionModal(isOpen, onClose, selectRef, lastVersion, options, onInstall, "Install")}
    </>
}


interface Props {
    config: ModpackInfo,
    id: string,
    onRecentInstall: () => void,
    autoInstall: boolean
}