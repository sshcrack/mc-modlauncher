import { Box, Button, Flex, Image, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { FaRegSun, FaRegMoon } from "react-icons/fa"
import React from 'react'

export default function NavBar() {
    const navColor = useColorModeValue('white.700', 'gray.700')
    const { colorMode, toggleColorMode } = useColorMode();

    const ToggleButton = colorMode === "dark" ? FaRegSun : FaRegMoon
    return <Flex bg={navColor} alignItems={"center"} justifyContent={"center"} paddingLeft={"1em"} paddingRight={"1em"} boxShadow={"xl"}>
        <Box flex={.75}>
            <Image src={"/assets/mc_logo.png"} width={"15em"} />
        </Box>
        <Flex flex='.25' justifyContent='space-evenly' alignItems='center'>
            <ToggleButton onClick={toggleColorMode} style={{ width: "2em", height: "2em", cursor: 'pointer'}}/>
            <Button colorScheme={"blue"}>Settings</Button>
        </Flex>
    </Flex>
}