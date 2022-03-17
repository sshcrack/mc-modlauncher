import { Badge, Center, Flex, Grid, Heading, Image, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import React, { useState } from 'react';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useFetch } from "use-http";
import { Globals } from '../../Globals';
import { ModpackInfo } from '../../interfaces/modpack';
import useModpackManager from '../hooks/useModpackManager';
import InstallButtons from './Buttons/InstallButton';
import PlayButtons from './Buttons/PlayButtons';
import ModpackSkeleton from './ModpackSkeleton';

const baseUrl = Globals.baseUrl;

export default function Modpack({ id, size, onRemove, custom }: { id: string, size: string, onRemove: () => void, custom: string[] }) {
    const isCustom = custom.includes(id);

    const { data: config, loading, error } = useFetch<ModpackInfo>(`${baseUrl}/${id}/config.json`, { retries: 3, cache: "no-cache" }, [])
    const { installed, version } = useModpackManager(id)
    const { width, height } = useWindowSize()
    const [ autoInstall, setAutoInstall ] = useState(isCustom && !installed)
    const [recentInstallation, setRecentInstallation] = useState(false)

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

    const onRecentInstall = () => {
        setAutoInstall(false)
        setRecentInstallation(true)
        setTimeout(() => setRecentInstallation(false), 1000)
    }

    return loading || error || !config ? <ModpackSkeleton absCover={absCover} cardBg={cardBg} size={size} /> :
        <>
            <Flex
                gridRow='1'
                gridColumn='1'
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
                    <Heading fontSize={`calc(${size} * .1)`} textOverflow='ellipsis'>{config.name}</Heading>
                    <Text fontSize={`calc(${size} * .075)`}>{config.description}</Text>
                </Center>
                <Flex p='3'>
                    {installed === undefined ? <Spinner /> : installed ? <PlayButtons id={id} config={config} onRemove={onRemove} /> :
                        <InstallButtons
                            id={id}
                            config={config}
                            onRecentInstall={onRecentInstall}
                            autoInstall={autoInstall}
                        />
                    }
                </Flex>
            </Flex>
            <Confetti
                recycle={true}
                numberOfPieces={recentInstallation ? 2500 : 0}
                confettiSource={{ x: 0, y: height, h: 0, w: 0 }}
                initialVelocityY={25}
                initialVelocityX={25}
                width={width - 1}
                height={height - 1}
            />
        </>
}
