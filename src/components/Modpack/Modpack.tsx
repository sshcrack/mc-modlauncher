import { Badge, Center, Flex, Grid, Heading, Image, Skeleton, Text, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { loremIpsum } from "react-lorem-ipsum";
import { useFetch } from "use-http";
import { Globals } from '../../Globals';
import { ModpackInfo } from '../../interfaces/modpack';
import { useModpackInfo } from '../hooks/useModpackInfo';
import PlayButtons from './Buttons/PlayButtons';
import InstallButtons from './Buttons/InstallButton';

const baseUrl = Globals.baseUrl;

export default function Modpack({ id, size }: { id: string, size: string }) {
    const { data: config, loading, error } = useFetch<ModpackInfo>(`${baseUrl}/${id}/config.json`, { retries: 3 }, [])
    const { installed, version } = useModpackInfo(id);

    const cardBg = useColorModeValue("white", "gray.900")

    const absCover = !config ? "" : `${baseUrl}/${id}/${config.cover}`
    const VersionBadge = <Badge
        bg='green.400'
        gridColumn='1'
        gridRow='1'
        height='fit-content'
        width='fit-content'
        p='1.5'
        rounded='md'
        boxShadow='xl'
    >{version?.id}</Badge>

    const Modpack = <Flex
        w={size}
        h='100%'
        bg={cardBg}
        boxShadow='2xl'
        rounded='md'
        overflow='hidden'
        direction='column'
        _hover={{
            filter: " drop-shadow(10px 2px 45px black)",
            transform: "scale(1.0125)"
        }}
        style={{
            transition: "all .2s ease-out"
        }}
    >
        <Grid flex='1'>
            <Image
                width='100%'
                minHeight='20em'
                objectFit='cover'
                src={absCover}
                rounded='md'
                gridColumn='1'
                gridRow='1'
            />
            {version && VersionBadge}
        </Grid>
        <Center flexDirection={'column'} textAlign='center' flex='0' mt='3'>
            <Heading fontSize={`calc(${size} * .1)`} textOverflow='ellipsis'>{config?.name}</Heading>
            <Text fontSize={`calc(${size} * .075)`}>{config?.description ?? genLoremDesc()}</Text>
        </Center>
        <Flex p='3'>
            {installed ? <PlayButtons id={id} config={config}/> : <InstallButtons />}
        </Flex>
    </Flex>

    return loading || error ? <Skeleton>
        {Modpack}
    </Skeleton> : Modpack
}

function genLoremDesc() {
    return loremIpsum()[0].substring(0, 125)
}