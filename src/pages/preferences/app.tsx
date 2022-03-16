import { Box, Button, Flex, Heading, Progress, StylesProvider, Text, useToast } from '@chakra-ui/react';
import prettyBytes from 'pretty-bytes';
import * as React from "react";
import { AiFillFolderOpen } from 'react-icons/ai';
import { HiTrash } from "react-icons/hi"
import { ImCog } from "react-icons/im"
import { motion } from "framer-motion"
import { useEffect, useState } from "react";
import InstallDir from '../../components/Preferences/InstallDir';
import Memory from '../../components/Preferences/Memory';
import { useLock } from '../../components/hooks/useLock';


const App = () => {
    const { preferences, system, folder, cache } = window.api
    const [installDir] = useState(() => preferences.get("install_dir"))
    const [memory, setMemory] = useState(() => preferences.get("memory"))
    const { isLocked } = useLock()
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

    const onMove = React.useCallback((installDir: string) => {
        toast({
            status: "info",
            description: "Preparing to move folders..."
        })

        return preferences.moveInstallDir(installDir)
            .then(() => {
                preferences.set("install_dir", installDir)
                toast({
                    status: "success",
                    description: "Folders moved"
                })
            })
            .catch(e => {
                toast({
                    status: "error",
                    description: `Error moving: ${e}`
                })
            })
    }, [])

    return <StylesProvider value={{}}>
        {
            isLocked ? <LockScreen /> :
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
                    <InstallDir value={installDir} onMove={dest => onMove(dest)} />

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
                            isLoading={isClearing}
                            colorScheme='green'
                            leftIcon={<HiTrash />}
                        >Clear Cache {prettyBytes(cacheSize)}</Button>
                    </Flex>
                </Flex>
        }
    </StylesProvider>
}

function LockScreen() {
    const { progress } = useLock();
    const { percent, status } = progress ?? { percent: 0, status: "Doing things...", ...progress}

    return <Flex
        pt='5'
        flexDir='column'
        justifyContent='center'
        alignItems='center'
        h='100%'
        w='100%'
    >
        <Flex
            justifyContent='center'
            alignItems='center'
        >
            <AiFillFolderOpen
                style={{
                    width: '3em',
                    height: '3em'
                }}
            />
            <Heading>Moving files...</Heading>
        </Flex>

        <Flex
            flexDir='column'
            justifyContent='center'
            alignItems='center'
            h='100%'
            w='90%'
        >
            <Progress
                value={Math.round(percent * 100 * 100) / 100}
                mr='5'
                w='100%'
                h='1.5em'
                rounded='xl'
                transitionDuration='.1s'
            />
            <Flex
                w='80%'
            >
                <Text flex='1'>{status}</Text>
                <Text>{percent * 100}%</Text>
            </Flex>
        </Flex>
    </Flex>
}
export default App;
