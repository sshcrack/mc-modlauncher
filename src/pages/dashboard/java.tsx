import { Flex, Heading, Progress, Spinner, Text, useToast } from '@chakra-ui/react'
import * as React from 'react'
import { FaJava } from 'react-icons/fa'
import { useLock } from '../../components/hooks/useLock'

export default function JavaLock({ hasJava, setJava }: { hasJava: boolean, setJava: (v: boolean) => unknown }) {
    const { system } = window.api
    const { java } = system

    const [ update, setUpdate ] = React.useState(() => Math.random())
    const { progress, isLocked } = useLock()
    const toast = useToast()

    React.useEffect(() => {
        if (isLocked)
            return

        java.version()
            .then(res => {
                console.log("Version is", res)
                if (res)
                    return setJava(true)

                setJava(false)
                toast({
                    status: "info",
                    description: "Installing java..."
                })
                console.log("Installing java...")
                return java.install()
                    .finally(() => {
                        setTimeout(() => setUpdate(Math.random()), 2000)
                    })
            })
    }, [isLocked, update])

    if (hasJava === undefined && !isLocked)
        return <Flex
            alignItems='center'
            justifyContent='center'
        >
            <Spinner />
            <Text>Checking if java is installed...</Text>
        </Flex>


    return <Flex
        justifyContent='space-around'
        alignItems='center'
        h='100%'
        flexDir='column'
        w='100%'
    >
        <Flex
            justifyContent='center'
            alignItems='center'
        >
            <FaJava style={{ width: '2.5em', height: '2.5em' }} />
            <Heading ml='5'>Java is not installed. Installing...</Heading>
        </Flex>
        {
            !progress ? <></>
                : <Flex
                    flexDir='column'
                    justifyContent='center'
                    alignItems='center'
                    h='100%'
                    w='90%'
                >
                    <Progress
                        value={progress.percent * 100}
                        mr='5'
                        w='100%'
                        h='1.5em'
                        rounded='xl'
                        transitionDuration='.1s'
                    />
                    <Flex
                        w='80%'
                    >
                        <Text flex='1'>{progress.status}</Text>
                        <Text>{Math.round(progress.percent * 100 * 100) / 100}%</Text>
                    </Flex>
                </Flex>
        }
    </Flex>

}