import { useToast, Wrap, WrapItem } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from "react";
import { Globals } from '../../Globals';
import Modpack from './Modpack';

const updateFrequency = 30 * 1000;
const listUrl = `${Globals.baseUrl}/list.json`

export default function ModpackOverview() {
    const [list, setList] = useState<string[] | null>(null);
    const [shouldUpdate, setUpdate] = useState(Math.random())

    const toast = useToast();


    const update = useCallback((delay: number) => {
        setTimeout(() => setUpdate(Math.random()), delay)
    }, [setUpdate])

    useEffect(() => {
        fetch(listUrl)
            .then(e => e.json())
            .then(e => {
                setList(e);
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

    return <Wrap spacing='6' m='6' >
        {(list ?? []).map(e => <WrapItem>
            <Modpack id={e} key={`modpack-${e}`} size='20rem' />
        </WrapItem>
        )}
    </Wrap>
}