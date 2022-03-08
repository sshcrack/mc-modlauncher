import { Box, Button, Flex, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Progress, Select, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import React, { createRef, useState } from 'react';
import confetti from "react-confetti"
import { Globals } from '../../../Globals';
import { ModpackInfo, Version } from '../../../interfaces/modpack';
import useModpackManager from '../../hooks/useModpackManager';
import PercentButton from './PercentButton';

export default function InstallButtons({ config, id, onRecentInstall }: { config: ModpackInfo, id: string, onRecentInstall: () => void }) {
    const { install, processing, progress } = useModpackManager(id)
    const [isOpen, setOpen] = useState(false)
    const toast = useToast()
    const selectRef = createRef<HTMLSelectElement>()


    const bgInstall = useColorModeValue("green.500", "green.500")
    const hoverInstall = useColorModeValue("green.400", "green.400")

    const lastVersion = Globals.getLastVersion(config)

    const options = config.versions.map(({ id, mcVersion }) => {
        return <option value={id}>{id}{mcVersion ? " " + mcVersion : ""}</option>
    })

    const onClose = () => {
        setOpen(false)
    }

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
        {VersionModal(isOpen, onClose, selectRef, lastVersion, options, onInstall)}
    </>
}

function VersionModal(isOpen: boolean, onClose: () => void, selectRef: React.RefObject<HTMLSelectElement>, lastVersion: Version, options: JSX.Element[], onInstall: () => void) {
    return <Modal
        isOpen={isOpen}
        onClose={onClose}
    >
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Select Modpack Version</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                <FormLabel htmlFor='version'>Version</FormLabel>
                <Select ref={selectRef} id='version' placeholder='Select Version' defaultValue={lastVersion.id}>
                    {options}
                </Select>
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='green' mr={3} onClick={onInstall}>
                    Install
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>;
}
