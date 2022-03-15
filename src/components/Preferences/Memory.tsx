import { Flex, FormLabel, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack } from '@chakra-ui/react'
import prettyBytes from 'pretty-bytes'
import React, { useState } from 'react'

export default function Memory({ defaultVal, max }: Props) {
    const [ value, setValue] = useState(defaultVal)
    const { preferences } = window.api

    const handleSet = () => preferences.set("memory", value)

    return <Flex
        justifyContent='center'
        alignItems='center'
        w='90%'
    >
        <FormLabel>Memory</FormLabel>
        <Slider defaultValue={value} onChange={setValue} max={max} onChangeEnd={() => handleSet()}>
            <SliderMark
                value={value}
                textAlign='center'
                bg='blue.500'
                color='white'
                mt='-10'
                ml='-5'
                w='20'
                rounded='base'
            >
                {prettyBytes(value)}
            </SliderMark>
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
        </Slider>
    </Flex>

}

interface Props {
    defaultVal: number,
    max: number,
    onSet: (install_dir: number) => void
}