import { Flex, FormLabel, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack } from '@chakra-ui/react'
import prettyBytes from 'pretty-bytes'
import React from 'react'

export default function Memory({ onSet, value, max }: Props) {
    const onChange = (newVal: number) => onSet(newVal)

    return <Flex
        justifyContent='center'
        alignItems='center'
        w='90%'
    >
        <FormLabel>Memory</FormLabel>
        <Slider defaultValue={value} onChange={onChange} max={max} >
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
    value: number,
    max: number,
    onSet: (install_dir: number) => void
}