import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, FormControl, FormLabel, Input, InputRightElement, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'
import { useLock } from '../hooks/useLock'

export default function InstallDir({ onSet, value }: Props) {
    const disclosure = useDisclosure()

    const [isBrowsing, setBrowsing] = useState(false)
    const { lock } = useLock()
    const { folder, preferences } = window.api
    const inputRef = useRef<HTMLInputElement>()
    const toast = useToast()

    const onBrowse = async () => {
        if (isBrowsing || !inputRef?.current)
            return

        toast({
            status: "info",
            description: "Opening folder..."
        })

        setBrowsing(true)
        const install_dir = preferences.get("install_dir")

        const res = await folder.select(install_dir)
        setBrowsing(false)

        if (!res)
            return

        const prev = inputRef.current.value
        if(prev === res)
            return toast({
                status: "info",
                description: "No changes made"
            })

        inputRef.current.value = res
        disclosure.onOpen()
    }

    const onSave = async () => {
        if(!inputRef?.current)
            return

        onSet(inputRef.current.value)
        toast({
            status: "info",
            description: "Preparing to move folders..."
        })

        lock()
    }

    return <><FormControl
        w='90%'
    >
        <FormLabel>Install Directory</FormLabel>
        <Input
            type='text'
            ref={inputRef}
            defaultValue={value}
        />
        <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={() => onBrowse()}>
                Browse
            </Button>
        </InputRightElement>
    </FormControl>
        <InstallMoveAlertDialog disclosure={disclosure} onConfirm={() => onSave()}/>
    </>

}

function InstallMoveAlertDialog({ disclosure, onConfirm }: AlertProps) {
    const cancelRef = useRef<HTMLButtonElement>()
    const { isOpen, onClose } = disclosure


    return <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
    >
        <AlertDialogOverlay>
            <AlertDialogContent>
                <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                    Move Installation Folder
                </AlertDialogHeader>

                <AlertDialogBody>
                    Are you sure? Moving files will take a while and can not be aborted.
                </AlertDialogBody>

                <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme='orange' onClick={() => { onClose(); onConfirm(); }} ml={3}>
                        Move
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialogOverlay>
    </AlertDialog>
}

interface Props {
    value: string,
    onSet: (install_dir: string) => void
}

interface AlertProps {
    disclosure: ReturnType<typeof useDisclosure>,
    onConfirm: () => void
}