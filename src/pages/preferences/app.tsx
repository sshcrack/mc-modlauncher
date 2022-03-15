import { Box, Button, Flex, Heading, StylesProvider, useToast } from '@chakra-ui/react';
import prettyBytes from 'pretty-bytes';
import * as React from "react";
import { AiFillFolderOpen } from 'react-icons/ai';
import { HiTrash } from "react-icons/hi"
import { ImCog } from "react-icons/im"
import { motion } from "framer-motion"
import { useEffect, useState } from "react";
import InstallDir from '../../components/Preferences/InstallDir';
import Memory from '../../components/Preferences/Memory';


const App = () => {
    const { preferences, system, folder, cache } = window.api
    const [installDir, setInstallDir] = useState(() => preferences.get("install_dir"))
    const [memory, setMemory] = useState(() => preferences.get("memory"))
    const [maxMemory, setMaxMemory] = useState(0)
    const [isClearing, setClearing] = useState(false)
    const [cacheSize, setCacheSize] = useState(0)
    const toast = useToast()

    useEffect(() => {
        setMemory(preferences.get("memory"))
        system.memory().then(mem => {
            setMaxMemory(mem)
        })

        cache.size()
            .then(res => setCacheSize(res))
    }, [])

    const clearCache = async () => {
        if (isClearing)
            return

        setClearing(true)
        toast({
            status: "info",
            title: "Clearing cache..."
        })


        await cache.clear().catch(() => {/**/ })
        const res = await cache.size()
        setCacheSize(res)

        toast({
            status: "success",
            title: "Cache cleared"
        })

        setClearing(false)
    }

    return <StylesProvider value={{}}>
        <Flex
            justifyContent='space-around'
            alignItems='center'
            flexDir='column'
            h='100%'
        >
            <Flex
                justifyContent='center'
                alignItems='center'
                flex='0'
            >
                <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                    whileHover={{
                        rotate: [0, 180],
                        transition: {
                            duration: 2,
                            ease: "circOut"
                        }
                    }}
                >
                    <ImCog style={{ width: '2em', height: '2em' }} />
                </motion.div>
                <Heading ml='1'>Preferences</Heading>
            </Flex>
            <InstallDir onSet={setInstallDir} value={installDir} />

            <Memory max={maxMemory} defaultVal={memory} onSet={setMemory} />

            <Flex
                justifyContent='center'
                alignItems='center'
                flexDir='column'
            >
                <Button
                    onClick={() => folder.open()}
                    colorScheme='blue'
                    leftIcon={<AiFillFolderOpen />}
                >Open Application Folder</Button>
                <Box mt='.5rem'></Box>
                <Button
                    onClick={() => clearCache()}
                    colorScheme='green'
                    leftIcon={<HiTrash />}
                >Clear Cache {prettyBytes(cacheSize)}</Button>
            </Flex>
        </Flex>
    </StylesProvider>
}
export default App;
