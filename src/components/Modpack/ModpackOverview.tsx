import { Flex, Heading, Spinner, useToast, Wrap, WrapItem } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from "react";
import { Globals } from '../../Globals';
import AddModpack from './AddModpack';
import Modpack from './Modpack';

const updateFrequency = 30 * 1000;
const listUrl = `${Globals.baseUrl}/list.json`

export default function ModpackOverview() {
    const { preferences, modpack } = window.api
    const [list, setList] = useState<string[] | null>(null);
    const [ custom, setCustom ] = useState<string[]>(() => preferences.get("custom_modpacks") ?? [])
    const [shouldUpdate, setUpdate] = useState(Math.random())

    const toast = useToast();


    const update = useCallback((delay: number) => {
        setTimeout(() => setUpdate(Math.random()), delay)
    }, [setUpdate])

    const onUpdate = () => {
        setUpdate(Math.random())
    }

    useEffect(() => {
        const custom = preferences.get("custom_modpacks")
        setCustom(custom)

        fetch(listUrl)
            .then(e => e.json())
            .then(e => ([...e, ...custom]))
            .then(async e => {
                const i = await modpack.list()
                const sorted = e.sort().sort((a, b) => (i.includes(b) ? 1 : 0) - (i.includes(a) ? 1 : 0))

                setList([...sorted]);
                update(updateFrequency)
            })
            .catch(e => {
                toast({
                    title: "Could not update modpack list",
                    description: `Trying again in 2s...`,
                    status: "warning",
                    isClosable: true,
                    duration: 2000
                })

                console.error("Could not fetch modpack list", e);
                update(2000);
            })
    }, [shouldUpdate])

    return list ? <Wrap spacing='6' p='6' >
        {(list ?? []).map(e => <WrapItem key={"wrap" + e}>
            <Modpack id={e} key={`modpack-${e}`} size='20rem' onRemove={() => {onUpdate(); console.log("Removing update")}} custom={custom}/>
        </WrapItem>
        )}
        <WrapItem>
            <AddModpack size='20rem' onAdd={onUpdate}/>
        </WrapItem>
    </Wrap>
    :
    <Flex
            alignItems='center'
            justifyContent='center'
            w='100%'
            h='100%'
    >
        <Spinner />
        <Heading ml='5'>Loading...</Heading>
    </Flex>
}