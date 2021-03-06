import { Flex, Heading, Spinner, useToast } from '@chakra-ui/react';
import * as React from "react";
import { useLock } from '../../components/hooks/useLock';
import ModpackOverview from '../../components/Modpack/ModpackOverview';
import NavBar from '../../components/NavBar';
import JavaLock from './java';


const App = () => {
    const { modpack } = window.api
    const { isLocked } = useLock()
    const [hasJava, setJava] = React.useState(undefined)
    const toast = useToast()

    React.useEffect(() => {
        modpack.clean()
            .then(e => {
                if (e === 0)
                    return

                toast({
                    title: `${e} modpacks cleaned`,
                    description: "Some modpacks may not be available anymore",
                    status: "warning"
                })
            })
    }, [])

    if(hasJava === undefined || hasJava === false)
        return <JavaLock setJava={setJava} hasJava={hasJava} />

    return !isLocked ? <ModpackMain />: <LockMain />
}

function ModpackMain() {
    return <>
        <NavBar />
        <ModpackOverview />
    </>
}

function LockMain() {
    return <Flex
        justifyContent='center'
        alignItems='center'
        h='100%'
    >
        <Spinner size='xl' mr='6' />
        <Heading>Launcher is locked. Waiting for processes to finish...</Heading>
    </Flex>
}

export default App;
