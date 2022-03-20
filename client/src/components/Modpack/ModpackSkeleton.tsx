import { Center, Flex, Grid, Heading, Image, Skeleton, Text } from '@chakra-ui/react';
import React from 'react';
import { loremIpsum } from "react-lorem-ipsum";

export default function ModpackSkeleton({ size, absCover, cardBg }: { size: string, absCover: string, cardBg: string }) {
    return <Skeleton>
        <Flex
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
                {"6.6.6"}
            </Grid>
            <Center flexDirection={'column'} textAlign='center' flex='0' mt='3'>
                <Heading fontSize={`calc(${size} * .1)`} textOverflow='ellipsis'>{"Skeleton"}</Heading>
                <Text fontSize={`calc(${size} * .075)`}>{genLoremDesc()}</Text>
            </Center>
            <Flex p='3'>
            </Flex>
        </Flex>
    </Skeleton>
}


function genLoremDesc() {
    return loremIpsum()[0].substring(0, 125)
}