import { Button, Flex, Image, Link, useColorMode, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { FaRegMoon, FaRegSun } from "react-icons/fa";

export default function NavBar() {
    const navColor = useColorModeValue('white.700', 'gray.700')
    const { colorMode, toggleColorMode } = useColorMode();

    const ToggleButton = colorMode === "dark" ? FaRegSun : FaRegMoon
    return <Flex bg={navColor} alignItems="center" justifyContent="center" paddingLeft="1em" paddingRight="1em" boxShadow="xl">
        <Flex flex={.75} h='100%' justifyContent='center' alignItems='center'>
            <Image src={"../assets/mc_logo.png"} width="15em" />
            <Flex w='100%' h='100%' justifyContent='center' alignItems='center'>
                <Flex h='100%' justifyContent='center' alignItems='center' ml='10' gap='2'>
                    <Image src={"../assets/clipture.svg"} w='3em' />
                    <Link fontSize='xl' href='https://clipture.sshcrack.me' target='_blank'>Also try clipture!</Link>
                </Flex>

            </Flex>
        </Flex>
        <Flex flex='.25' justifyContent='space-evenly' alignItems='center'>
            <ToggleButton onClick={toggleColorMode} style={{ width: "2em", height: "2em", cursor: 'pointer' }} />
            <Button colorScheme={"blue"} onClick={() => window.api.preferences.open()}>Settings</Button>
        </Flex>
    </Flex>
}