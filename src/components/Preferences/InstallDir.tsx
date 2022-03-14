import { Button, FormControl, FormLabel, Input, InputRightElement, useToast } from '@chakra-ui/react'
import React, { useRef, useState } from 'react'

export default function InstallDir({ onSet, value }: Props) {
    const [ isBrowsing, setBrowsing ] = useState(false)
    const { folder, preferences } = window.api
    const inputRef = useRef<HTMLInputElement>()
    const toast = useToast()

    const onBrowse = async () => {
        if(isBrowsing || !inputRef?.current)
            return

        toast({
            status: "info",
            description: "Opening folder..."
        })

        setBrowsing(true)
        const install_dir = preferences.get("install_dir")

        const res = await folder.select(install_dir)
        setBrowsing(false)

        if(!res)
            return

        inputRef.current.value = res
        onSet(res)
    }

    return <FormControl
        w='90%'
    >
        <FormLabel>Install Directory</FormLabel>
        <Input
            type='text'
            ref={inputRef}
            defaultValue={value}
        />
        <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={() => onBrowse()}>
                Browse
            </Button>
        </InputRightElement>
    </FormControl>

}

interface Props {
    value: string,
    onSet: (install_dir: string) => void
}