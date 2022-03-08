import { useToast } from '@chakra-ui/react';
import * as React from "react";
import ModpackOverview from '../../components/Modpack/ModpackOverview';
import NavBar from '../../components/NavBar';


const App = () => {
    const toast = useToast()
    React.useEffect(() => {
        window.api.modpack.clean()
            .then(e => {
                if(e === 0)
                    return

                toast({
                    title: `${e} modpacks cleaned`,
                    description: "Some modpacks may not be available anymore",
                    status: "warning"
                })
            })
    }, [  ])

    return <>
        <NavBar />
        <ModpackOverview />
    </>
}
export default App;
