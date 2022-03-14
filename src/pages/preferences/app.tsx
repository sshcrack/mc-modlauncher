import { Box, Flex, Heading, StylesProvider } from '@chakra-ui/react';
import * as React from "react";
import { useState, useEffect } from "react"
import InstallDir from '../../components/Preferences/InstallDir';
import Memory from '../../components/Preferences/Memory';


const App = () => {
    const { preferences, system } = window.api
    const [installDir, setInstallDir] = useState(() => preferences.get("install_dir"))
    const [memory, setMemory] = useState(() => preferences.get("memory"))
    const [maxMemory, setMaxMemory] = useState(0)

    useEffect(() => {
        setMemory(preferences.get("memory"))
        system.memory().then(mem => {
            setMaxMemory(mem)
        })
    }, [])

    return <StylesProvider value={{}}>
        <Flex
            justifyContent='center'
            alignItems='center'
            flexDir='column'
        >
            <Heading>Preferences</Heading>
            <Box mt='1.2rem'></Box>
            <InstallDir onSet={setInstallDir} value={installDir} />
            <Box mt='1.2rem'></Box>
            <Memory max={maxMemory} value={memory} onSet={setMemory}></Memory>
        </Flex>
    </StylesProvider>
}
export default App;
