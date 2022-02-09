import { Button, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export default function InstallButtons() {

    const bgPlay = useColorModeValue("green.500", "green.500")
    const hoverPlay = useColorModeValue("green.400", "green.400")

    return <>
        <Button flex='1' bg={bgPlay} _hover={{ bg: hoverPlay }}>Install</Button>
    </>
}