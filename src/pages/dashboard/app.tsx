import { Flex, Heading, Spinner, useToast } from '@chakra-ui/react';
import * as React from "react";
import { useLock } from '../../components/hooks/useLock';
import ModpackOverview from '../../components/Modpack/ModpackOverview';
import NavBar from '../../components/NavBar';


const App = () => {
    const { modpack } = window.api
    const { isLocked } = useLock()
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

    return !isLocked ? <>
        <NavBar />
        <ModpackOverview />
    </>

    : <Flex
        justifyContent='center'
        alignItems='center'
        h='100%'
    >
        <Spinner size='xl' mr='6'/>
        <Heading>Launcher is locked. Processes to finish...</Heading>
    </Flex>
}
export default App;
