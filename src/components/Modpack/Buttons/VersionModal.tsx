import { Button, FormLabel, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select } from '@chakra-ui/react';
import React from 'react';
import { Version } from '../../../interfaces/modpack';

export function VersionModal(isOpen: boolean, onClose: () => void, selectRef: React.RefObject<HTMLSelectElement>, lastVersion: Version, options: JSX.Element[], onInstall: () => void, confirm: string) {
    const placeholder = "Select Version"
    const handleClose = () => {
        if(!selectRef?.current?.value)
            return

        if(selectRef.current.value === placeholder)
            return

        onClose()
    }

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
                <Select ref={selectRef} id='version' placeholder={placeholder} defaultValue={lastVersion.id} required={true}>
                    {options}
                </Select>
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='green' mr={3} onClick={onInstall}>
                    {confirm}
                </Button>
                <Button onClick={handleClose}>Cancel</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>;
}
