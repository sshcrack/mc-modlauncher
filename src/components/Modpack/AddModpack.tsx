import { Button, Flex, FormControl, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useColorModeValue, useToast } from '@chakra-ui/react';
import Ajv from "ajv";
import React, { useRef, useState } from 'react';
import { BsPlusLg } from "react-icons/bs";
import { Globals } from '../../Globals';
import { RenderLogger } from '../../interfaces/renderLogger';

const logger = RenderLogger.get("Modpack", "AddModpack")
export default function AddModpack({ size, onAdd }: { size: string, onAdd: () => void }) {
    const [isOpen, setOpen] = useState(false)
    const cardBg = useColorModeValue("white", "gray.900")
    const toast = useToast()

    const addModpack = async (id: string) => {
        const { preferences } = window.api;
        const { baseUrl } = Globals

        const schemaRaw = await fetch(baseUrl + "/schema.json").then(e => e.json())
        const list = await fetch(baseUrl + "/list.json").then(e => e.json())

        logger.log("Adding modpack", id)
        toast({
            status: "info",
            title: "Adding modpack..."
        })

        const config = await fetch(`${baseUrl}/${id}/config.json`).then(e => e.json())
        const custom = preferences.get("custom_modpacks") ?? []

        console.log("Config is", config)
        if (!config)
            return toast({
                status: "error",
                title: "Could not fetch modpack config",
            })

        if ([custom, ...list].includes(id))
            return toast({
                status: "error",
                title: "Modpack already added",
            })

        const ajv = new Ajv({ strict: false })
        const validate = ajv.compile(schemaRaw)
        const isValid = validate(config);

        if (!isValid)
            return toast({
                status: "error",
                title: "Modpack config is not valid.",
                description: validate.errors.map(e => e.message).join("\n")
            })

        custom.push(id)
        preferences.set("custom_modpacks", custom)
        logger.log("Added modpack", id)
        toast({
            status: "success",
            title: "Modpack added."
        })

        onAdd();
    }

    const onClose = () => setOpen(false)

    return <>
        <Flex
            gridRow='1'
            gridColumn='1'
            w={size}
            h='100%'
            bg={cardBg}
            onClick={() => setOpen(true)}
            cursor='pointer'
            boxShadow='2xl'
            rounded='md'
            overflow='hidden'
            direction='column'
            _hover={{
                filter: "drop-shadow(10px 2px 45px black)",
                transform: "scale(1.0125)"
            }}
            style={{
                transition: "all .2s ease-out"
            }}
        >
            <Flex
                w='100%'
                h='100%'
                border='8px'
                flexDir='column'
                borderStyle='dashed'
                rounded='md'
                _hover={{
                    filter: ""
                }}
                justifyContent='center'
                alignItems='center'
            >
                <Flex
                    width='100%'
                    minHeight='15em'
                    rounded='md'
                    justifyContent='center'
                    alignItems='center'
                    flexDir='column'
                >
                    <BsPlusLg style={{
                        width: "3.5em",
                        height: "3.5em",
                        "marginBottom": "1em"
                    }} />
                    <Heading fontSize={`calc(${size} * .1)`} textOverflow='ellipsis'>Add Modpack</Heading>
                </Flex>
            </Flex>
        </Flex>
        <UrlModal isOpen={isOpen} onAdd={addModpack} onClose={onClose} />
    </>
}

function UrlModal({ isOpen, onAdd, onClose }: { isOpen: boolean, onAdd: (url: string) => void, onClose: () => void }) {
    const inputRef = useRef<HTMLInputElement>()
    const placeholder = "Enter ID..."

    const handleClose = () => {
        onClose()
        if (!inputRef?.current?.value)
            return

        if (inputRef.current.value === placeholder)
            return

        onAdd(inputRef.current.value)
    }

    const onChange = () => {
        if (!inputRef?.current?.value)
            return

        inputRef.current.value = inputRef.current.value.replace(Globals.baseUrl + "/", "")
    }

    return <Modal
        isOpen={isOpen}
        onClose={onClose}
        size='2xl'
        motionPreset='slideInBottom'
    >
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Enter ID of the Modpack</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
                <FormControl onSubmit={handleClose}>
                    <Input
                        autoFocus={true}
                        required={true}
                        ref={inputRef}
                        placeholder={placeholder}
                        onChange={onChange}
                        onKeyPress={k => {
                            if(k.key === "Enter")
                                handleClose()
                        }}
                    />
                </FormControl>
            </ModalBody>

            <ModalFooter>
                <Button colorScheme='green' mr={3} onClick={handleClose}>
                    Add
                </Button>
                <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>;
}
